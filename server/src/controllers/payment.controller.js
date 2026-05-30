import crypto from "crypto";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import { razorpay } from "../config/razorpay.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyUser } from "../services/notification.service.js";

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.customer.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");
  if (!order.invoice?.amount) throw new ApiError(400, "Invoice is not ready");

  const rpOrder = await razorpay.orders.create({
    amount: Math.round(order.invoice.amount * 100),
    currency: "INR",
    receipt: `order_${order._id}`
  });

  const payment = await Payment.create({
    order: order._id,
    customer: req.user._id,
    provider: "razorpay",
    providerOrderId: rpOrder.id,
    amount: order.invoice.amount,
    status: "created",
    raw: rpOrder
  });

  res.json({ payment, razorpayOrder: rpOrder, key: process.env.RAZORPAY_KEY_ID });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) throw new ApiError(400, "Payment verification failed");

  const payment = await Payment.findOneAndUpdate(
    { providerOrderId: razorpay_order_id },
    {
      providerPaymentId: razorpay_payment_id,
      providerSignature: razorpay_signature,
      status: "success"
    },
    { new: true }
  ).populate("order");

  if (!payment) throw new ApiError(404, "Payment not found");
  const order = await Order.findById(payment.order._id).populate("customer", "email name");
  order.setStatus("Payment Completed", req.user._id, "Online payment received");
  await order.save();

  const io = req.app.get("io");
  await notifyUser({
    io,
    user: order.customer,
    order: order._id,
    title: "Payment received",
    message: "Your payment was successful.",
    type: "payment_received",
    email: order.customer.email
  });
  io.to(`order:${order._id}`).emit("order:updated", order);
  res.json({ payment, order });
});

export const markCodReceived = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate("customer", "email name");
  if (!order) throw new ApiError(404, "Order not found");
  if (order.paymentMethod !== "cod") throw new ApiError(400, "Order is not a COD order");
  if (!order.invoice?.amount) throw new ApiError(400, "Invoice is not ready");
  if (order.paymentStatus === "paid") throw new ApiError(400, "COD payment is already marked received");

  order.paymentStatus = "paid";
  order.setStatus("Payment Completed", req.user._id, "COD payment received");
  await order.save();

  await Payment.findOneAndUpdate(
    { order: order._id, provider: "cod" },
    {
      order: order._id,
      customer: order.customer._id,
      provider: "cod",
      amount: order.invoice.amount,
      status: "cod_received"
    },
    { new: true, upsert: true }
  );

  const io = req.app.get("io");
  await notifyUser({
    io,
    user: order.customer,
    order: order._id,
    title: "Payment received",
    message: "Your COD payment has been received.",
    type: "payment_received",
    email: order.customer.email
  });
  io.to(`order:${order._id}`).emit("order:updated", order);
  res.json({ order });
});
