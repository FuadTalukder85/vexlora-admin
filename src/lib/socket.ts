import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./api-client";

let socket: Socket | null = null;

export const getAdminSocket = (): Socket => {
  if (!socket || !socket.connected) {
    const rawUrl = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL || "";
    // Strip trailing /api/v1 or /api if present to connect to root socket server
    const serverUrl = rawUrl.replace(/\/api(\/v\d+)?\/?$/, "");

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("vexlora_admin_token") || ""
        : "";

    socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }

  return socket;
};
