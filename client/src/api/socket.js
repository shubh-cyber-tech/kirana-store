import { io } from "socket.io-client";
import { store } from "../store/store.js";

let socket;

export const getSocket = () => {
  const token = store.getState().auth.token;
  if (!token) return null;
  if (!socket || socket.auth?.token !== token) {
    socket?.disconnect();
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token }
    });
  }
  return socket;
};
