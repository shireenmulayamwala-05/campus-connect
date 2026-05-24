const express = require("express");
const registrationCollection = require("../models/registrationsModel");
const userAuth = require("../middlewear/userAuth");
const registrationRouter = express.Router();

registrationRouter.post("/registerInEvent", userAuth, async (req, res) => {
  try {
    const {
      eventId,
      registrationType,
      team, // already fetched from getGroupMember
      responses,
    } = req.body;
    const userId = req.id; //got from userAuth
    let registrationData = {
      eventId,
      registrationType,
      responses: responses || [],
      status: "confirmed", // directly confirmed
    };

    if (registrationType === "Individual") {
      registrationData.participantId = userId;
    }

    if (registrationType === "Group") {
      registrationData.group = team; // directly save team object from getGroupMember
    }

    const registration = await registrationCollection.create(registrationData);

    return res.status(200).json({
      success: true,
      msg: "Free event registration successful",
      registration,
    });
  } catch (error) {
    console.error("Free Event Registration Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});
module.exports = registrationRouter;
