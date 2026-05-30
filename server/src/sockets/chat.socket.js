import Chat from "../models/Chat.js";
import Order from "../models/Order.js";

export const registerChatSocket = (io, socket) => {
  socket.on("order:join", async (orderId) => {
    const order = await Order.findById(orderId).select("customer");
    if (!order) return;
    const isOwner = order.customer.toString() === socket.user.id;
    if (!isOwner && socket.user.role !== "admin") return;
    socket.join(`order:${orderId}`);
  });

  socket.on("chat:send", async ({ orderId, body }) => {
    if (!body?.trim()) return;
    const order = await Order.findById(orderId).select("customer");
    if (!order) return;
    const isOwner = order.customer.toString() === socket.user.id;
    if (!isOwner && socket.user.role !== "admin") return;

    const chat = await Chat.findOneAndUpdate(
      { order: orderId },
      {
        $setOnInsert: { order: orderId, participants: [order.customer] },
        $push: { messages: { sender: socket.user.id, body: body.trim(), readBy: [socket.user.id] } }
      },
      { upsert: true, new: true }
    ).populate("messages.sender", "name role");

    const message = chat.messages.at(-1);
    io.to(`order:${orderId}`).emit("chat:message", { order: orderId, message });
    io.to("admins").emit("chat:admin_notice", { order: orderId, message });
    io.to(`user:${order.customer}`).emit("chat:customer_notice", { order: orderId, message });
  });
};
