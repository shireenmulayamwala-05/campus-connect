const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: [
      "EVENT_LIVE",
      "REGISTRATION_SUCCESS",
      "GROUP_ADDED",
      "EVENT_UPDATE",
      "EVENT_CANCELED",
      "WARNING",
      "APPROVAL",
      "REJECTION",
    ],
    required: true,
  },
  sender: {
    type: String,
    enum: ["SYSTEM", "ADMIN", "ORGANIZER"],
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "sender",
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: false,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});
const notificationCollection = mongoose.model(
  "Notifications",
  notificationSchema
);
module.exports = notificationCollection;
