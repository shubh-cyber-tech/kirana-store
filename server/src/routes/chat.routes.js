import { Router } from "express";
import { getOrderChat } from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/orders/:orderId", protect, getOrderChat);

export default router;
