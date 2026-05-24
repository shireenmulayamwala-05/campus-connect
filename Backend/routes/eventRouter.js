const express = require("express");
const userAuth = require("../middlewear/userAuth");
const { upload } = require("../config/cloudinary");
const {
  createEvent,
  getPendingEvents,
  getSinglePendinEvent,
  uploadEventOnApprovedEvent,
  deleteOnePendingEvent,
  getApprovedEvent,
  getSingleApprovedEvent,
  getOrganizedEvents,
  getParticipatedEvents,
} = require("../controllers/eventController");
const adminAuth = require("../middlewear/adminAuth");
const eventRouter = express.Router();

eventRouter.post(
  "/register-event",
  userAuth,
  upload.fields([
    { name: "eventPoster", maxCount: 1 },
    { name: "identityProof", maxCount: 1 },
    { name: "permissionLetter", maxCount: 1 },
    { name: "eventBrochure", maxCount: 1 },
  ]),
  createEvent
);
eventRouter.get("/get-pendingEvents", adminAuth, getPendingEvents); //admin route
eventRouter.post("/get-singlePendingEvent", adminAuth, getSinglePendinEvent); //admin routes
eventRouter.post("/upload-event", adminAuth, uploadEventOnApprovedEvent); //admin route
eventRouter.post("/delete-pendingEvent", adminAuth, deleteOnePendingEvent); //
eventRouter.get("/get-approved-events", getApprovedEvent);
eventRouter.get("/get-organizedEvent", userAuth, getOrganizedEvents);
eventRouter.get("/get-participatedEvent", userAuth, getParticipatedEvents);

eventRouter.get("/approved-events/:id", getSingleApprovedEvent);
module.exports = eventRouter;
