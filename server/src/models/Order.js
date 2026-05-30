import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "Order Placed",
  "Slip Under Review",
  "Bill Generated",
  "Payment Pending",
  "Payment Completed",
  "Order Packed",
  "Order Dispatched",
  "Out for Delivery",
  "Order Delivered"
];

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const manualItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, enum: ["kg", "g", "ltr", "ml", "pcs", "packet", "box"], default: "kg" },
    note: String
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderType: { type: String, enum: ["slip", "manual"], default: "slip" },
    slip: {
      url: String,
      publicId: String,
      format: String,
      resourceType: String,
      originalName: String
    },
    manualItems: [manualItemSchema],
    invoice: {
      url: String,
      publicId: String,
      uploadedAt: Date,
      amount: Number
    },
    notes: String,
    address: {
      label: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String
    },
    paymentMethod: { type: String, enum: ["online", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "cod"], default: "pending" },
    reviewStatus: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    status: { type: String, enum: ORDER_STATUSES, default: "Order Placed" },
    timeline: { type: [timelineSchema], default: () => [{ status: "Order Placed" }] },
    adminNotes: String,
    rejectionReason: String,
    deliveryPartner: {
      name: String,
      phone: String,
      trackingUrl: String
    },
    estimatedDelivery: Date
  },
  { timestamps: true }
);

orderSchema.methods.setStatus = function setStatus(status, updatedBy, note) {
  this.status = status;
  this.timeline.push({ status, updatedBy, note });
  if (status === "Payment Completed") this.paymentStatus = "paid";
  if (status === "Bill Generated" && this.paymentMethod === "online") this.paymentStatus = "pending";
};

export default mongoose.model("Order", orderSchema);
