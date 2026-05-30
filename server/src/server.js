import http from "http";
import "./config/env.js";
import { Server } from "socket.io";
import cors from "cors";

import app from "./app.js";
import { connectDb } from "./config/db.js";
import { corsOptions } from "./config/cors.js";

import { authenticateSocket } from "./sockets/auth.socket.js";
import { registerChatSocket } from "./sockets/chat.socket.js";

import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const port = process.env.PORT || 5000;

/* CORS */
app.use(cors(corsOptions));

const server = http.createServer(app);

/* SOCKET IO */
export const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

/* SOCKET AUTH */
io.use(authenticateSocket);

io.on("connection", (socket) => {
  socket.join(`user:${socket.user.id}`);

  if (socket.user.role === "admin") {
    socket.join("admins");
  }

  registerChatSocket(io, socket);
});

/* API ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chats", chatRoutes);

/* START SERVER */
connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`MongoDB connected`);
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
