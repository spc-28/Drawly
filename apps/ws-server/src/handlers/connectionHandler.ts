import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { checkUser } from "@repo/backend-common/config";
import { addUser, removeUser, getUser } from "../store/userStore.js";
import { logger } from "../logger.js";
import { handleMessage } from "./messageHandler.js";

export function handleConnection(socket: WebSocket, request: IncomingMessage): void {
    const param = new URLSearchParams(request.url?.split("?")[1]);
    const userId = checkUser(param.get("token") || "");

    if (!userId) {
        socket.close();
        return;
    }

    addUser(socket, userId);

    socket.on("message", (data) => handleMessage(socket, userId, data));

    socket.on("pong", () => {
        const user = getUser(socket);
        if (user) user.isAlive = true;
    });

    socket.on("close", () => removeUser(socket));

    socket.on("error", (error) => {
        logger.error({ err: error, userId }, "Socket error");
        removeUser(socket);
        socket.terminate();
    });
}
