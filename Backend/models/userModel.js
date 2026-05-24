const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    mobileNo: { type: String }, // Optional
    password: { type: String, required: true },
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    wishToParticipate: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    organizedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    resetOtp: { type: String, default: "" },
    resetOtpExpiresAt: { type: Date },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false }, // Fixed typo: isVerifeid → isVerified
  },
  { timestamps: true }
);

const userCollection = mongoose.model("user", userSchema);
module.exports = userCollection;
