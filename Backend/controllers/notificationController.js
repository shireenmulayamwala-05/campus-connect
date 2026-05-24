const notificationCollection = require("../models/notificationModel");
const userCollection = require("../models/userModel");
const mongoose = require("mongoose");
// as of now we will be using this controller to send the notification to the organizer
const sendNotification = async (req, res) => {
  try {
    const { userEmail, title, message, typeOFNotification, from } = req.body;
    const newNotification = new notificationCollection({
      userEmail,
      title,
      message,
      typeOFNotification,
      from,
    });
    await newNotification.save();
    res.json({
      success: true,
      msg: "Notification send successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};

//controller for fetching notification on fronend
const getNotifications = async (req, res) => {
  try {
    const userId = req.id;
    const userExist = await userCollection.findById(userId);
    if (!userExist) {
      return res.json({
        success: false,
        msg: "Invalid user",
      });
    }

    const userEmail = userExist.email;

    // Pagination params (default: page=1, limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Fetch total count for frontend
    const totalCount = await notificationCollection.countDocuments({
      userEmail,
    });

    // Fetch notifications (unread first, then latest createdAt)
    const notifications = await notificationCollection
      .find({ userEmail })
      .sort({ isRead: 1, createdAt: -1 }) // unread first, then newest
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      msg: "Notifications fetched successfully",
      notifications,
      pagination: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      msg: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    // Get userId from auth middleware (e.g., req.user._id)
    const userId = req.id; // Adjust based on your middleware (e.g., req.user.id)
    const { notificationID } = req.body; // Match frontend's notificationId

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({
        success: false,
        msg: "Invalid user ID",
      });
    }

    // Validate notificationId
    if (!notificationID || !mongoose.Types.ObjectId.isValid(notificationID)) {
      return res.json({
        success: false,
        msg: "Invalid notification ID",
      });
    }

    // Find user
    const user = await userCollection.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        msg: "User not found",
      });
    }

    // Find notification
    const notification = await notificationCollection.findById(notificationID);
    if (!notification) {
      return res.json({
        success: false,
        msg: "Notification not found",
      });
    }

    // Verify notification belongs to user (using userEmail)
    if (notification.userEmail !== user.email) {
      // Adjust based on your User model
      return res.json({
        success: false,
        msg: "Unauthorized: Notification does not belong to this user",
      });
    }
    console.log(notification.typeOFNotification);
    // Mark notification as read
    notification.isRead = true;
    await notification.save();

    return res.json({
      success: true,
      msg: "Notification marked as read",
    });
  } catch (error) {
    return res.json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = { sendNotification, getNotifications, markAsRead };
