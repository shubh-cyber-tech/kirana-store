import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["razorpay", "cod"], required: true },
    providerOrderId: String,
    providerPaymentId: String,
    providerSignature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "success", "failed", "cod_pending", "cod_received"], default: "created" },
    failureReason: String,
    raw: Object
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
