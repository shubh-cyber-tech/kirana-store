import { Router } from "express";
import { dashboardStats, promoteUser } from "../controllers/admin.controller.js";
import { adminListOrders, reviewSlip, updateOrderStatus, uploadInvoice } from "../controllers/order.controller.js";
import { markCodReceived } from "../controllers/payment.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/dashboard", dashboardStats);
router.patch("/users/role", promoteUser);
router.get("/orders", adminListOrders);
router.patch("/orders/:id/review", reviewSlip);
router.patch("/orders/:id/status", updateOrderStatus);
router.post("/orders/:id/invoice", upload.single("invoice"), uploadInvoice);
router.post("/orders/:orderId/cod-received", markCodReceived);

export default router;
