const mongoose = require("mongoose");

const pendingEventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  organizerName: { type: String, required: true },
  organizerEmail: { type: String, required: true },
  organizerMobNo: { type: String, required: true },
  dateOfEvent: { type: Date, required: true, min: Date.now },
  timeOfEvent: { type: String, required: true },

  location: {
    text: { type: String, required: true },
    googleMapLink: { type: String },
  },

  category: {
    type: String,
    required: true,
    enum: ["Technical", "Cultural", "Sports", "Workshop", "Other"],
  },

  mode: {
    type: String,
    required: true,
    enum: ["Offline", "Online", "Hybrid"],
  },

  isEventPaid: {
    type: Boolean,
    required: true,
    default: false,
  },

  description: {
    type: String,
    required: true,
  },

  documents: {
    eventPoster: { type: String, required: true },
    identityProof: { type: String, required: true },
    permissionLetter: { type: String, required: true },
    eventBrochure: { type: String, required: true },
  },

  faq: {
    type: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    maxlength: 5,
  },
  status: {
    type: String,
    enum: ["Accepted", "Rejected", "Pending"],
    default: "Pending",
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const PendingEventCollection = mongoose.model(
  "PendingEvent",
  pendingEventSchema
);

module.exports = PendingEventCollection;
