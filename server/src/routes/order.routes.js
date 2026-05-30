import { Router } from "express";
import {
  createOrder,
  downloadOrderInvoice,
  downloadOrderSlip,
  getMyOrders,
  getOrder,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", protect, upload.single("slip"), createOrder);
router.get("/", protect, getMyOrders);
router.get("/:id/slip/download", protect, downloadOrderSlip);
router.get("/:id/invoice/download", protect, downloadOrderInvoice);
router.get("/:id", protect, getOrder);

export default router;
