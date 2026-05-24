const mongoose = require("mongoose");
const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  registrationType: {
    type: String,
    enum: ["individual", "group"],
    required: true,
  },

  // For Individual
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // For Group
  group: {
    groupCode: { type: String },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    leaderName: { type: String },
    leaderEmail: { type: String },
    leaderContact: { type: String },
    members: [
      {
        _Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: { type: String },
        email: { type: String },
        mobileNo: { type: String },
      },
    ],
  },

  // Dynamic form responses
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId },
      answer: { type: String },
    },
  ],

  // Just a reference to payment
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  refundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Refund",
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  isCheckedIn: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

const registrationCollection = mongoose.model(
  "Registration",
  registrationSchema
);
module.exports = registrationCollection;
