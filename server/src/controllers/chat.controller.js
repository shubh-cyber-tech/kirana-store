import Chat from "../models/Chat.js";
import Order from "../models/Order.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getOrderChat = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).select("customer");
  if (!order) throw new ApiError(404, "Order not found");
  const isOwner = order.customer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") throw new ApiError(403, "Not authorized");

  const chat = await Chat.findOne({ order: order._id }).populate("messages.sender", "name role");
  res.json({ chat: chat || { order: order._id, messages: [] } });
});
