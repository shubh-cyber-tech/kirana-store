import { Router } from "express";
import { body } from "express-validator";
import { forgotPassword, login, me, register, resetPassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  register
);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", body("password").isLength({ min: 8 }), resetPassword);

export default router;
