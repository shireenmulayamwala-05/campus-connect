const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  //Event and organizer detaisl
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true },
  organizerName: { type: String, required: true },
  organizerEmail: { type: String, required: true },
  organizerMobNo: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["Technical", "Cultural", "Sports", "Workshop", "Other"],
  },
  venueType: {
    type: String,
    enum: ["online", "offline", "hybrid"],
    default: "offline",
  },
  //date , time & location
  location: {
    hardcoded: { type: String, required: true },
    googleMapLink: { type: String },
  },
  startDate: { type: Date, required: true }, //starting date of the vent
  endDate: { type: Date, required: true }, //ending date of the event

  startTime: { type: String, required: true }, //starting time of the event
  endTime: { type: String, required: true }, //ending time of the event

  registrationDeadline: { type: Date }, //last date of registration dead line
  registrationDeadLineTime: { type: String },

  //capacity
  capacity: { type: Number, required: true }, // max participants
  registeredCount: { type: Number, default: 0 }, // track live registrations
  isFree: { type: Boolean, default: false },
  price: { type: Number, default: 0 }, // per ticket price (₹

  // Verification & Status
  isVerified: { type: Boolean, default: false }, // admin approves event before visible
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },

  // Refunds / Cancellations
  cancellationPolicy: {
    type: String,
    default: "No refunds after registration",
  },
  allowRefunds: { type: Boolean, default: false },
  allowRegistration: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  //form feild
  form: [
    {
      typeOfQuestion: {
        type: String,
        enum: [
          "text",
          "email",
          "phone",
          "number",
          "select",
          "checkbox",
          "date",
          "file",
        ],
        required: true,
      },
      option: {
        type: Array,
        default: undefined,
      },
      question: { type: String, required: true },
      placeholder: {
        type: String,
      },
    },
  ],

  //reference of the participants
  registrations: {
    type: [String],
  },
  teamSize: {
    type: Number,
    required: true,
  },
  //documents
  documents: {
    eventPoster: { type: String, required: true },
    identityProof: { type: String, required: true },
    permissionLetter: { type: String, required: true },
    eventBrochure: { type: String, required: true },
  },
  //faqs
  faq: {
    type: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    maxlength: 5,
  },
});
const EventCollection = mongoose.model("Event", eventSchema);
module.exports = EventCollection;
