const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const paymentCollection = require("../models/paymentModel");
const registrationCollection = require("../models/registrationsModel");
const userCollection = require("../models/userModel");

const razorpayRouter = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RIJ8fTLUFb3UNC",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "4EHEMPt0636DIsCrc6OUk8l3",
});

// ==========================
// Create Order API
// ==========================
razorpayRouter.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("Creating Razorpay order for amount:", amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid amount provided",
      });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    console.log("Razorpay order options:", options);

    const order = await razorpayInstance.orders.create(options);

    console.log("Razorpay order created successfully:", order.id);

    return res.status(200).json({
      success: true,
      msg: "Order created",
      order,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

// ==========================
// Verify Payment API
// ==========================
razorpayRouter.post("/verify", async (req, res) => {
  try {
    const {
      eventId,
      registrationType,
      group,
      responses,
      userId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    // console.log(group)

    // Step 1: Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "4EHEMPt0636DIsCrc6OUk8l3"
      )
      .update(body.toString())
      .digest("hex");

    // Step 2: Verify signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        msg: "Payment verification failed",
      });
    }

    // Step 3: Save Registration first
    const registration = await registrationCollection.create({
      eventId,
      registrationType,
      participantId: registrationType === "individual" ? userId : undefined,
      group: registrationType === "group" ? group : undefined,
      responses: responses || [],
      paymentId: null, // Temporarily null, update later
      status: "confirmed",
    });

    // Step 4: Save Payment with registrationId
    const payment = await paymentCollection.create({
      registrationId: registration._id, // Use valid registration ID
      eventId,
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency: "INR",
    });

    // Step 5: Update registration with paymentId
    registration.paymentId = payment._id;
    await registration.save();

    // Step 6: Update user registered events
    if (registrationType === "group") {
      for (const member of group.members) {
        const user = await userCollection.findById(member._id);
        if (user) {
          user.registeredEvents.push(eventId);
          await user.save();
        }
      }
    } else {
      const user = await userCollection.findById(userId);
      if (user) {
        user.registeredEvents.push(eventId);
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      msg: "Payment verified & registration successful",
      payment,
      registration,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = razorpayRouter;
