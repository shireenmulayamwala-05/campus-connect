const express = require("express");
const registrationCollection = require("../models/registrationsModel");
const userAuth = require("../middlewear/userAuth");
const transporter = require("../config/nodemailer.js");
const notificationCollection = require("../models/notificationModel");
const GroupCollection = require("../models/groupsModel.js");
const EventCollection = require("../models/EventModel.js");
const userDashBoardRouter = express.Router();
userDashBoardRouter.get("/get-contestants", userAuth, async (req, res) => {
  try {
    const { eventId } = req.query;

    const data = await registrationCollection
      .find({ eventId })
      .select("group responses isCheckedIn")
      .lean(); // optional: exclude _id if you don’t need it

    for (const item of data) {
      const groupDoc = await GroupCollection.findOne({
        groupCode: item.group.groupCode,
      }).select("groupName -_id");
      item.group.groupName = groupDoc ? groupDoc.groupName : undefined;
      console.log(item.group.groupName);
    }
    console.log(data);
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No contestants found for this event",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "List of contestants fetched successfully",
      data,
    });
  } catch (err) {
    console.error(err); // log error for debugging
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
});
userDashBoardRouter.post("/checkIn", userAuth, async (req, res) => {
  try {
    const { groupCode } = req.body;
    console.log("yoo i was called");
    if (!groupCode) {
      return res.status(404).json({
        success: false,
        msg: "Invalid groupCode",
      });
    }
    const updatedGroup = await registrationCollection.findOneAndUpdate(
      { "group.groupCode": groupCode }, // filter (no space!)
      { $set: { isCheckedIn: true } }, // update
      { new: true } // options → return updated doc
    );
    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        msg: "Error in updating the group details",
      });
    }
    return res.status(200).json({
      success: true,
      msg: "participants CheckedIn successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal server error ",
    });
  }
});
userDashBoardRouter.post("/UncheckIn", userAuth, async (req, res) => {
  try {
    const { groupCode } = req.body;
    if (!groupCode) {
      return res.status(404).json({
        success: false,
        msg: "Invalid groupCode",
      });
    }
    const updatedGroup = await registrationCollection.findOneAndUpdate(
      { "group.groupCode": groupCode }, // filter (no space!)
      { $set: { isCheckedIn: false } }, // update
      { new: true } // options → return updated doc
    );
    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        msg: "Error in updating the group details",
      });
    }
    return res.status(200).json({
      success: true,
      msg: "participants UnCheckedIn successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal server error ",
    });
  }
});
userDashBoardRouter.post("/send-updates", userAuth, async (req, res) => {
  try {
    const { groupCode, subject, message } = req.body;
    const organizerId = req.id;

    // 1. Find group by groupCode
    const retrievedData = await registrationCollection
      .findOne({ "group.groupCode": groupCode })
      .select("group.members");

    if (!retrievedData) {
      return res.status(404).json({
        success: false,
        msg: "Group not found",
      });
    }

    const memberEmails = retrievedData.group.members.map((item) => item.email);

    if (!memberEmails || memberEmails.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No members found to send emails",
      });
    }

    // 2. Send emails sequentially
    for (const email of memberEmails) {
      await transporter.sendMail({
        from: process.env.SENDER_MAIL,
        to: email,
        subject,
        text: message,
        html: `<p>${message}</p>`,
      });
    }

    // 3. Build notifications
    const notifications = memberEmails.map((email) => ({
      userEmail: email,
      title: subject,
      message,
      type: "EVENT_UPDATE",
      sender: "ORGANIZER",
      senderId: organizerId,
      createdAt: new Date(),
    }));

    // 4. Insert all notifications at once
    await notificationCollection.insertMany(notifications);

    return res.status(200).json({
      success: true,
      msg: "Emails and notifications sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});
userDashBoardRouter.post("/event-settings", userAuth, async (req, res) => {
  try {
    const {
      eventId,
      title,
      description,
      location, // frontend: { hardcoded, googleMapLink }
      startDate,
      endDate,
      startTime,
      endTime,
      registrationDeadline,
      registrationDeadLineTime,
      capacity,
      allowRegistration,
    } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        msg: "Event ID is required",
      });
    }

    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    if (allowRegistration !== undefined)
      updateFields.allowRegistration = allowRegistration;

    // Map frontend fields → backend schema
    if (location && (location.hardcoded || location.googleMapLink)) {
      if (location.hardcoded)
        updateFields["location.hardcoded"] = location.hardcoded;
      if (location.googleMapLink)
        updateFields["location.googleMapLink"] = location.googleMapLink;
    }

    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    if (startTime) updateFields.startTime = startTime;
    if (endTime) updateFields.endTime = endTime;
    if (registrationDeadline)
      updateFields.registrationDeadline = registrationDeadline;
    if (registrationDeadLineTime)
      updateFields.registrationDeadLineTime = registrationDeadLineTime;
    if (capacity) updateFields.capacity = capacity;

    const updatedEvent = await EventCollection.findByIdAndUpdate(
      eventId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        msg: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event settings:", error);
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
});
userDashBoardRouter.get("/get-partial-details", userAuth, async (req, res) => {
  try {
    const { eventId } = req.query; // <-- get eventId from query

    if (!eventId) {
      return res.status(400).json({
        success: false,
        msg: "Event ID is required",
      });
    }

    const event = await EventCollection.findById(eventId)
      .select(
        "title description location startDate endDate startTime endTime registrationDeadline registrationDeadLineTime capacity allowRegistration"
      )
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Partial event details fetched successfully",
      event,
    });
  } catch (error) {
    console.error("Error fetching partial event details:", error);
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
});
userDashBoardRouter.get("/get-responses", userAuth, async (req, res) => {
  try {
    const { eventId, groupCode } = req.query;

    if (!eventId || !groupCode) {
      return res.status(400).json({
        success: false,
        msg: "eventId and groupCode are required",
      });
    }

    // Fetch the registration document
    const registration = await registrationCollection
      .findOne({
        eventId,
        "group.groupCode": groupCode,
      })
      .select("responses -_id");

    if (!registration || !registration.responses?.length) {
      return res.status(404).json({
        success: false,
        msg: "No responses found",
      });
    }

    // Fetch the event to get the questions
    const event = await EventCollection.findById(eventId).select("form -_id");

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found",
      });
    }

    // Map answers to questions
    const responsesWithQuestions = registration.responses.map((r) => {
      const questionObj = event.form.find(
        (q) => q._id.toString() === r.questionId.toString()
      );

      return {
        questionId: r.questionId,
        question: questionObj ? questionObj.question : "Unknown question",
        answer: r.answer,
      };
    });

    return res.status(200).json({
      success: true,
      msg: "Responses fetched successfully",
      responses: responsesWithQuestions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
});

userDashBoardRouter.post("/notify-all", userAuth, async (req, res) => {
  try {
    const { eventId, subject, message } = req.body;

    if (!eventId || !subject || !message) {
      return res.status(400).json({
        success: false,
        msg: "eventId, subject, and message are required",
      });
    }

    let registrations = await registrationCollection
      .find({ eventId })
      .select("group.members.email -_id");

    const emailsSet = new Set();
    registrations.forEach((item) => {
      item.group.members.forEach((member) => emailsSet.add(member.email));
    });

    const notifications = Array.from(emailsSet).map((email) => ({
      title: subject,
      message,
      userEmail: email,
      type: "EVENT_UPDATE",
      sender: "ORGANIZER",
    }));

    if (notifications.length > 0) {
      await notificationCollection.insertMany(notifications);
    }

    return res.status(200).json({
      success: true,
      msg: "Notification sent to all contestants",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
});

module.exports = userDashBoardRouter;
