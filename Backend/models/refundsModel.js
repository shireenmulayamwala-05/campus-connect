const refundSchema = new mongoose.Schema({
  //this feild will tell which payment we are refunding
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  // this feild will help us to know to which participant we are refunding
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  razorpay_refund_id: { type: String }, // from Razorpay
  amount: { type: Number, required: true },
  //   reason: { type: String },

  status: {
    type: String,
    enum: ["initiated", "processed", "failed"],
    default: "initiated",
  },

  createdAt: { type: Date, default: Date.now },
});
