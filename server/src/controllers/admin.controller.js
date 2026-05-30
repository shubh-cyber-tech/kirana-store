import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardStats = asyncHandler(async (_req, res) => {
  const [totalOrders, pendingOrders, deliveredOrders, revenue, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: { $nin: ["Order Delivered"] } }),
    Order.countDocuments({ status: "Order Delivered" }),
    Payment.aggregate([{ $match: { status: { $in: ["success", "cod_received"] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Order.find().populate("customer", "name email phone").sort("-createdAt").limit(8)
  ]);

  res.json({
    totalOrders,
    pendingOrders,
    deliveredOrders,
    revenue: revenue[0]?.total || 0,
    recentOrders
  });
});

export const promoteUser = asyncHandler(async (req, res) => {
  const { email, role = "admin" } = req.body;
  if (!email) throw new ApiError(400, "Email is required");
  if (!["admin", "customer"].includes(role)) throw new ApiError(400, "Invalid role");

  const user = await User.findOneAndUpdate({ email: email.toLowerCase().trim() }, { role }, { new: true }).select(
    "name email role isActive"
  );
  if (!user) throw new ApiError(404, "User not found");

  res.json({ user });
});
