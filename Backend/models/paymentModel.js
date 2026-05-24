const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  //this feild will let us know which team/indivisual`s payment is this
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
  },
  //will tell this  payment belongs to which event
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  //id of the indivisual who made payments
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  //razorpaydetails
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String }, // comes after successful payment
  razorpay_signature: { type: String },

  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  //this will tell whether this payment is refunded or not
  isRefunded: { type: Boolean, default: false },
  //and if the payment is refunded then the id of refund this
  refundId: { type: mongoose.Schema.Types.ObjectId, ref: "Refund" },
});
const paymentCollection = mongoose.model("Payment", paymentSchema);
module.exports = paymentCollection;
// this payment will store the successfull payments only
