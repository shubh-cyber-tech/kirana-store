import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/email.js";

export const notifyUser = async ({ io, user, order, title, message, type = "general", email }) => {
  const notification = await Notification.create({
    user: user._id || user,
    order,
    title,
    message,
    type
  });

  io?.to(`user:${user._id || user}`).emit("notification:new", notification);

  if (email) {
    try {
      await sendEmail({ to: email, subject: title, html: `<p>${message}</p>` });
    } catch (error) {
      console.warn(`Email notification failed: ${error.message}`);
    }
  }

  return notification;
};
