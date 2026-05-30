import { Router } from "express";
import { updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.put("/me", protect, updateProfile);

export default router;
