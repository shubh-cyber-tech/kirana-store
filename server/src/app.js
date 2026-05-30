import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { corsOptions, isAllowedOrigin } from "./config/cors.js";

import {
  errorHandler,
  notFound,
} from "./middleware/error.middleware.js";

const app = express();

/* =========================
   SECURITY
========================= */

app.use(helmet());

/* =========================
   CORS FIX
========================= */

app.use(cors(corsOptions));

/* HANDLE PREFLIGHT REQUESTS */
app.options("*", (req, res) => {
  if (isAllowedOrigin(req.headers.origin)) {
    res.header(
      "Access-Control-Allow-Origin",
      req.headers.origin
    );
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.header(
    "Access-Control-Allow-Credentials",
    "true"
  );

  return res.sendStatus(200);
});

/* =========================
   MIDDLEWARES
========================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
  })
);

/* =========================
   TEST ROUTES
========================= */

app.get("/", (_req, res) => {
  res.send("API Working Successfully");
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "kirana-api",
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

/* =========================
   NOT FOUND
========================= */

app.use(notFound);

/* =========================
   ERROR HANDLER
========================= */

app.use(errorHandler);

export default app;
