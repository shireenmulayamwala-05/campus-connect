const GroupCollection = require("../models/groupsModel");
const userCollection = require("../models/userModel");
const { nanoid } = require("nanoid");

const getMember = async (req, res) => {
  try {
    let { email } = req.query;
    email = email.trim();

    const doExist = await userCollection
      .findOne({ email })
      .select("_id userName");

    if (!doExist) {
      return res.status(404).json({
        success: false,
        msg: "User does not exist with this email",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "User fetched successfully",
      user: doExist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const createGroup = async (req, res) => {
  try {
    const leaderId = req.id;
    console.log(leaderId);
    const { groupName, groupDescription, members, teamSize } = req.body;
    const groupCode = nanoid(8);
    //verify whether all the members are valid
    const validUser = await userCollection.find({ _id: { $in: members } });
    if (validUser.length !== members.length) {
      return res.status(400).json({
        success: false,
        msg: "One or more users are invalid users",
      });
    }
    //duplicate user
    const uniqueIds = [...new Set(members)];
    if (uniqueIds.length !== members.length) {
      return res.status(400).json({
        success: false,
        msg: "Duplicate member found",
      });
    }
    if (teamSize < members.length) {
      return res.status(400).json({
        success: false,
        msg: `Team size should be at max ${teamSize}`,
      });
    }
    //save the group
    const newGroup = new GroupCollection({
      groupName,
      groupDescription,
      leaderId,
      membersID: members,
      teamSize,
      groupCode,
    });
    await newGroup.save();
    //add the groupId to group feild of the all users
    for (const id of members) {
      await userCollection.updateOne(
        { _id: id },
        { $addToSet: { groups: newGroup._id } }
      );
    }
    await userCollection.updateOne(
      { _id: leaderId },
      { $addToSet: { groups: newGroup._id } }
    );
    return res.status(200).json({
      success: true,
      msg: "Group created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const userId = req.id; // from middleware
    const { groupCode } = req.params;

    // find the group first
    const groupExist = await GroupCollection.findOne({ groupCode });
    if (!groupExist) {
      return res.status(404).json({
        success: false,
        msg: "Invalid groupCode",
      });
    }

    // check if the requester is the leader
    if (userId !== groupExist.leaderId.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Only the leader can delete the group",
      });
    }

    // get all member IDs including leader
    const members = groupExist.membersID;
    const leader = groupExist.leaderId;

    // delete the group
    await GroupCollection.deleteOne({ groupCode });

    // remove group reference from all members
    await Promise.all(
      members.map((id) =>
        userCollection.updateOne(
          { _id: id },
          { $pull: { groups: groupExist._id } }
        )
      )
    );

    // remove group reference from leader as well
    await userCollection.updateOne(
      { _id: leader },
      { $pull: { groups: groupExist._id } }
    );

    return res.status(200).json({
      success: true,
      msg: "Group deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const addGroupMember = async (req, res) => {
  try {
    const leaderId = req.id; // logged-in user
    const { groupCode, memberId } = req.body; // memberId to add

    // find group
    const group = await GroupCollection.findOne({ groupCode });
    if (!group)
      return res.status(404).json({ success: false, msg: "Invalid groupCode" });

    // only leader can add
    if (leaderId !== group.leaderId.toString()) {
      return res
        .status(403)
        .json({ success: false, msg: "Only leader can add members" });
    }

    // check if member already in group
    if (group.membersID.includes(memberId)) {
      return res
        .status(400)
        .json({ success: false, msg: "Member already in group" });
    }

    // check team size limit
    if (group.membersID.length + 1 > group.teamSize) {
      return res
        .status(400)
        .json({ success: false, msg: "Team size limit reached" });
    }

    // add member to group
    group.membersID.push(memberId);
    await group.save();

    // add group to user's groups array
    await userCollection.updateOne(
      { _id: memberId },
      { $addToSet: { groups: group._id } }
    );

    return res
      .status(200)
      .json({ success: true, msg: "Member added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};
const removeGroupMember = async (req, res) => {
  try {
    const leaderId = req.id;
    const { groupCode, memberId } = req.body;

    const group = await GroupCollection.findOne({ groupCode });
    if (!group)
      return res.status(404).json({ success: false, msg: "Invalid groupCode" });

    if (leaderId !== group.leaderId.toString()) {
      return res
        .status(403)
        .json({ success: false, msg: "Only leader can remove members" });
    }

    // check if member is in group
    if (!group.membersID.includes(memberId)) {
      return res
        .status(400)
        .json({ success: false, msg: "Member not found in group" });
    }

    // remove member from group
    group.membersID = group.membersID.filter(
      (id) => id.toString() !== memberId
    );
    await group.save();

    // remove group from user's groups array
    await userCollection.updateOne(
      { _id: memberId },
      { $pull: { groups: group._id } }
    );

    return res
      .status(200)
      .json({ success: true, msg: "Member removed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};
const leaveGroup = async (req, res) => {
  try {
    const userId = req.id; // logged-in user
    const { groupCode } = req.body;

    const group = await GroupCollection.findOne({ groupCode });
    if (!group)
      return res.status(404).json({ success: false, msg: "Invalid groupCode" });

    // leader cannot leave
    if (userId === group.leaderId.toString()) {
      return res
        .status(403)
        .json({ success: false, msg: "Leader cannot leave the group" });
    }

    // check if user is actually a member
    if (!group.membersID.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, msg: "You are not a member of this group" });
    }

    // remove user from group
    group.membersID = group.membersID.filter((id) => id.toString() !== userId);
    await group.save();

    // remove group from user's groups array
    await userCollection.updateOne(
      { _id: userId },
      { $pull: { groups: group._id } }
    );

    return res
      .status(200)
      .json({ success: true, msg: "You have left the group" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

const listMyGroups = async (req, res) => {
  try {
    const userId = req.id;
    const groups = await GroupCollection.find({
      $or: [{ leaderId: userId }, { membersID: userId }],
    })
      .populate("leaderId", "userName email")
      .populate("membersID", "userName email")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, msg: "Groups fetched", groups });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

const getGroupMember = async (req, res) => {
  try {
    const leaderId = req.id;
    const { groupCode, teamSize } = req.query; // Changed from req.body to req.query for GET request

    // Convert teamSize to number
    const teamSizeNum = parseInt(teamSize);

    const group = await GroupCollection.findOne({ groupCode });
    if (!group) {
      return res.status(401).json({
        success: false,
        msg: "Invalid group Code",
      });
    }

    if (group.leaderId.toString() !== leaderId.toString()) {
      return res.status(401).json({
        success: false,
        msg: "You are not the leader of this group",
      });
    }

    const leader = await userCollection
      .findById(leaderId)
      .select("userName email mobileNo"); // leader info

    const members = await Promise.all(
      group.membersID.map(async (id) => {
        return await userCollection
          .findById(id)
          .select("userName email mobileNo");
      })
    );

    // ✅ Calculate total team size (leader + members)
    const totalTeamCount = members.length;

    if (teamSizeNum && totalTeamCount < teamSizeNum) {
      return res.status(400).json({
        success: false,
        msg: `Team size should be ${teamSizeNum}, but currently only ${totalTeamCount}`,
        currentSize: totalTeamCount,
        requiredSize: teamSizeNum,
      });
    }

    const data = {
      groupCode,
      leaderId,
      leaderName: leader.userName,
      leaderEmail: leader.email,
      leaderContact: leader.mobileNo,
      members,
      teamSize: totalTeamCount,
      groupName: group.groupName,
    };

    return res.status(200).json({
      success: true,
      msg: "Team members fetched",
      team: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getMember,
  createGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  listMyGroups,
  getGroupMember,
};
