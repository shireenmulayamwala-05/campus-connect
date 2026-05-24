const express = require("express");
const {
  sendNotification,
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const adminAuth = require("../middlewear/adminAuth");
const userAuth = require("../middlewear/userAuth");
const notificationRouter = express.Router();
notificationRouter.post(
  "/send-notification-toOrganizer",
  adminAuth,
  sendNotification
);
notificationRouter.get("/get-notifications", userAuth, getNotifications);
notificationRouter.post("/markAsRead", userAuth, markAsRead);

module.exports = notificationRouter;
