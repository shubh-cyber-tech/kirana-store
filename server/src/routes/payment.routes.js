import { Router } from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.post("/razorpay/:orderId", protect, createRazorpayOrder);

export default router;
