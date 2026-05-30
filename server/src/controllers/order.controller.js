import Order, {
  ORDER_STATUSES,
} from "../models/Order.js";

import User from "../models/User.js";
import Chat from "../models/Chat.js";

import { uploadBuffer } from "../utils/cloudUpload.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { notifyUser } from "../services/notification.service.js";

const extensionFromContentType = (contentType) => {
  if (contentType?.includes("pdf")) return "pdf";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return "jpg";
  return "pdf";
};

const extensionFromOrderFile = (file, contentType) => {
  if (file?.originalName?.includes(".")) {
    return file.originalName.split(".").pop().toLowerCase();
  }

  if (file?.format) return file.format.toLowerCase();
  return extensionFromContentType(contentType);
};

const streamRemoteFile = async ({ res, url, filename }) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(502, "Unable to fetch file for download");
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
};

/* =========================
   CREATE ORDER
========================= */

export const createOrder =
  asyncHandler(async (req, res) => {
    const manualItems = JSON.parse(
      req.body.manualItems || "[]"
    )
      .map((item) => ({
        name: String(
          item.name || ""
        ).trim(),

        quantity: Number(
          item.quantity
        ),

        unit: item.unit || "kg",

        note: String(
          item.note || ""
        ).trim(),
      }))
      .filter(
        (item) =>
          item.name &&
          item.quantity > 0
      );

    if (
      !req.file &&
      manualItems.length === 0
    ) {
      throw new ApiError(
        400,
        "Upload a grocery slip or add at least one item manually"
      );
    }

    let uploaded;

    if (req.file) {
      uploaded = await uploadBuffer({
        buffer: req.file.buffer,
        folder: "kirana/slips",
        filename:
          req.file.originalname,
      });
    }

    const address = JSON.parse(
      req.body.address || "{}"
    );

    const order = await Order.create({
      customer: req.user._id,

      orderType: req.file
        ? "slip"
        : "manual",

      slip: uploaded
        ? {
            url: uploaded.secure_url,
            publicId:
              uploaded.public_id,

            format:
              uploaded.format,

            resourceType:
              uploaded.resource_type,

            originalName:
              req.file.originalname,
          }
        : undefined,

      manualItems,

      notes: req.body.notes,

      address,

      paymentMethod:
        req.body.paymentMethod,
    });

    await Chat.create({
      order: order._id,
      participants: [
        req.user._id,
      ],
      messages: [],
    });

    const io = req.app.get("io");

    io.to("admins").emit(
      "order:new",
      order
    );

    res.status(201).json({
      order,
    });
  });

/* =========================
   GET MY ORDERS
========================= */

export const getMyOrders =
  asyncHandler(async (req, res) => {
    const orders = await Order.find({
      customer: req.user._id,
    }).sort("-createdAt");

    res.json({ orders });
  });

/* =========================
   GET SINGLE ORDER
========================= */

export const getOrder =
  asyncHandler(async (req, res) => {
    const order =
      await Order.findById(
        req.params.id
      ).populate(
        "customer",
        "name email phone"
      );

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    const isOwner =
      order.customer._id.toString() ===
      req.user._id.toString();

    if (
      !isOwner &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "Not authorized"
      );
    }

    res.json({
      order,
      statuses:
        ORDER_STATUSES,
    });
  });

export const downloadOrderSlip =
  asyncHandler(async (req, res) => {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    const isOwner =
      order.customer.toString() ===
      req.user._id.toString();

    if (
      !isOwner &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "Not authorized"
      );
    }

    if (!order.slip?.url) {
      throw new ApiError(
        404,
        "Slip file is not available"
      );
    }

    const extension =
      extensionFromOrderFile(
        order.slip
      );

    await streamRemoteFile({
      res,
      url: order.slip.url,
      filename: `slip-${order._id}.${extension}`,
    });
  });

export const downloadOrderInvoice =
  asyncHandler(async (req, res) => {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    const isOwner =
      order.customer.toString() ===
      req.user._id.toString();

    if (
      !isOwner &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "Not authorized"
      );
    }

    if (!order.invoice?.url) {
      throw new ApiError(
        404,
        "Invoice file is not available"
      );
    }

    await streamRemoteFile({
      res,
      url: order.invoice.url,
      filename: `invoice-${order._id}.pdf`,
    });
  });

/* =========================
   ADMIN LIST ORDERS
========================= */

export const adminListOrders =
  asyncHandler(async (req, res) => {
    const { status, q } =
      req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (q) {
      const users =
        await User.find({
          $or: [
            {
              name: new RegExp(
                q,
                "i"
              ),
            },

            {
              email: new RegExp(
                q,
                "i"
              ),
            },
          ],
        }).select("_id");

      filter.customer = {
        $in: users.map(
          (u) => u._id
        ),
      };
    }

    const orders =
      await Order.find(filter)
        .populate(
          "customer",
          "name email phone"
        )
        .sort("-createdAt");

    res.json({
      orders,
      statuses:
        ORDER_STATUSES,
    });
  });

/* =========================
   UPDATE ORDER STATUS
========================= */

export const updateOrderStatus =
  asyncHandler(async (req, res) => {
    const order =
      await Order.findById(
        req.params.id
      ).populate(
        "customer",
        "email name"
      );

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    if (
      !ORDER_STATUSES.includes(
        req.body.status
      )
    ) {
      throw new ApiError(
        400,
        "Invalid status"
      );
    }

    /* UPDATE STATUS */

    order.status =
      req.body.status;

    order.timeline.push({
      status:
        req.body.status,

      updatedBy:
        req.user._id,

      note:
        req.body.note || "",
    });

    if (
      req.body.status ===
      "Payment Completed"
    ) {
      order.paymentStatus =
        "paid";
    }

    if (
      req.body.status ===
        "Bill Generated" &&
      order.paymentMethod ===
        "online"
    ) {
      order.paymentStatus =
        "pending";
    }

    if (
      req.body.deliveryPartner
    ) {
      order.deliveryPartner =
        req.body.deliveryPartner;
    }

    if (
      req.body
        .estimatedDelivery
    ) {
      order.estimatedDelivery =
        req.body.estimatedDelivery;
    }

    await order.save();

    const io = req.app.get("io");

    await notifyUser({
      io,

      user: order.customer,

      order: order._id,

      title: "Order update",

      message: `Your order is now: ${order.status}`,

      type: order.status.includes(
        "Dispatched"
      )
        ? "order_dispatched"
        : "delivery_update",

      email:
        order.customer.email,
    });

    io.to(
      `order:${order._id}`
    ).emit(
      "order:updated",
      order
    );

    res.json({ order });
  });

/* =========================
   REVIEW SLIP
========================= */

export const reviewSlip =
  asyncHandler(async (req, res) => {
    const order =
      await Order.findById(
        req.params.id
      ).populate(
        "customer",
        "email name"
      );

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    if (
      ![
        "accepted",
        "rejected",
      ].includes(
        req.body.reviewStatus
      )
    ) {
      throw new ApiError(
        400,
        "Invalid review status"
      );
    }

    order.reviewStatus =
      req.body.reviewStatus;

    order.rejectionReason =
      req.body.reviewStatus ===
      "rejected"
        ? req.body.reason
        : undefined;

    if (
      req.body.reviewStatus ===
      "accepted"
    ) {
      order.status =
        "Slip Under Review";

      order.timeline.push({
        status:
          "Slip Under Review",

        updatedBy:
          req.user._id,

        note:
          "Slip accepted for billing",
      });
    }

    await order.save();

    const io = req.app.get("io");

    await notifyUser({
      io,

      user: order.customer,

      order: order._id,

      title:
        req.body
          .reviewStatus ===
        "accepted"
          ? "Slip accepted"
          : "Slip rejected",

      message:
        req.body
          .reviewStatus ===
        "accepted"
          ? "Your grocery slip is under review."
          : `Your grocery slip was rejected. ${
              order.rejectionReason ||
              ""
            }`,

      type: "general",

      email:
        order.customer.email,
    });

    io.to(
      `order:${order._id}`
    ).emit(
      "order:updated",
      order
    );

    res.json({ order });
  });

/* =========================
   UPLOAD INVOICE
========================= */

export const uploadInvoice =
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(
        400,
        "Invoice PDF is required"
      );
    }

    const order =
      await Order.findById(
        req.params.id
      ).populate(
        "customer",
        "email name"
      );

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    const uploaded =
      await uploadBuffer({
        buffer:
          req.file.buffer,

        folder:
          "kirana/invoices",

        resourceType:
          "raw",

        filename:
          req.file.originalname,
      });

    order.invoice = {
      url: uploaded.secure_url,

      publicId:
        uploaded.public_id,

      uploadedAt:
        new Date(),

      amount: Number(
        req.body.amount || 0
      ),
    };

    const nextStatus =
      order.paymentMethod ===
      "cod"
        ? "Bill Generated"
        : "Payment Pending";

    order.status =
      nextStatus;

    order.timeline.push({
      status: nextStatus,

      updatedBy:
        req.user._id,

      note:
        "Invoice uploaded",
    });

    if (
      order.paymentMethod ===
      "cod"
    ) {
      order.paymentStatus =
        "cod";
    }

    await order.save();

    const io = req.app.get("io");

    await notifyUser({
      io,

      user: order.customer,

      order: order._id,

      title: "Bill uploaded",

      message:
        "Your grocery bill is ready. Please review the invoice.",

      type: "bill_uploaded",

      email:
        order.customer.email,
    });

    io.to(
      `order:${order._id}`
    ).emit(
      "order:updated",
      order
    );

    res.json({ order });
  });
