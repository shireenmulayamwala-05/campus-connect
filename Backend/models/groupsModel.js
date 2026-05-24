const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    teamSize: {
      type: Number,
      min: 1,
      max: 15,
      required: true,
    },
    groupDescription: {
      type: String,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    groupCode: {
      type: String,
      required: true,
      unique: true, // optional
    },
    membersID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const GroupCollection = mongoose.model("Group", groupSchema);

module.exports = GroupCollection;
