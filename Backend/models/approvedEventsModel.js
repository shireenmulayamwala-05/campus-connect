const mongoose = require("mongoose");

const approvedEventsSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  organizerName: { type: String, required: true },
  organizerEmail: { type: String, required: true },
  organizerMobNo: { type: String, required: true },
  dateOfEvent: { type: Date, required: true, min: Date.now },
  timeOfEvent: { type: String, required: true },

  location: {
    hardcoded: { type: String, required: true },
    googleMapLink: { type: String },
  },
  upiOfOrganizer: {
    type: String,
    required: false,
  },
  intake: {
    type: Number,
    default: 100,
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

  eventPoster: { type: String, required: true },

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
    default: "Accepted",
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

const approvedEventsCollection = mongoose.model(
  "ApprovedEvents",
  approvedEventsSchema
);

module.exports = approvedEventsCollection;
