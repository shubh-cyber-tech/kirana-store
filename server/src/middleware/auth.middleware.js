import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(
  async (req, _res, next) => {
    let token;

    /* =========================
       GET TOKEN
    ========================= */

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    /* =========================
       CHECK TOKEN
    ========================= */

    if (!token) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    try {
      /* =========================
         VERIFY TOKEN
      ========================= */

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      /* =========================
         FIND USER
      ========================= */

      const user = await User.findById(
        decoded.id
      ).select(
        "-password -resetPasswordToken -resetPasswordExpires"
      );

      if (!user || !user.isActive) {
        throw new ApiError(
          401,
          "Invalid session"
        );
      }

      req.user = user;

      next();
    } catch (error) {
      throw new ApiError(
        401,
        "Invalid or expired token"
      );
    }
  }
);

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "Not authorized"
      );
    }

    next();
  };