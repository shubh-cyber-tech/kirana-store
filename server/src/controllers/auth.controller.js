import crypto from "crypto";
import { validationResult } from "express-validator";

import User from "../models/User.js";

import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";

/* =========================
   SEND AUTH RESPONSE
========================= */

const sendAuth = (res, user, status = 200) => {
  const token = signToken(user);

  /* COOKIE */
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(status).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    },
  });
};

/* =========================
   REGISTER
========================= */

export const register = asyncHandler(
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    const existing = await User.findOne({
      email,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
    });

    sendAuth(res, user, 201);
  }
);

/* =========================
   LOGIN
========================= */

export const login = asyncHandler(
  async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    sendAuth(res, user);
  }
);

/* =========================
   CURRENT USER
========================= */

export const me = asyncHandler(
  async (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

/* =========================
   FORGOT PASSWORD
========================= */

export const forgotPassword =
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.json({
        success: true,
        message:
          "If email exists, reset link sent",
      });
    }

    const token =
      user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
      <h2>Password Reset</h2>
      <p>Click below link:</p>
      <a href="${url}">${url}</a>
    `,
    });

    res.json({
      success: true,
      message: "Reset link sent",
    });
  });

/* =========================
   RESET PASSWORD
========================= */

export const resetPassword =
  asyncHandler(async (req, res) => {
    const hashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Token invalid or expired",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpires =
      undefined;

    await user.save();

    sendAuth(res, user);
  });