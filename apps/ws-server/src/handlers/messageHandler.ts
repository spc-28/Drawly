import { prismaClient } from "@repo/db/client";
import { broadcast, getUser } from "../store/userStore.js";
import { WebSocket, RawData } from "ws";
import { logger } from "../logger.js";

export async function handleMessage(socket: WebSocket, userId: string, data: RawData): Promise<void> {
    let parsedData: { type: string; roomId?: unknown; message?: any };

    try {
        parsedData = JSON.parse(data.toString());
    } catch {
        logger.warn({ userId }, "Invalid JSON received");
        return;
    }

    if (!parsedData.type || typeof parsedData.type !== "string") return;

    const roomId = Number(parsedData.roomId);

    if (parsedData.type === "join") {
        if (!Number.isInteger(roomId) || roomId <= 0) return;
        const user = getUser(socket);
        if (user && !user.rooms.includes(roomId)) {
            user.rooms.push(roomId);
        }
        return;
    }

    if (parsedData.type === "leave") {
        if (!Number.isInteger(roomId) || roomId <= 0) return;
        const user = getUser(socket);
        if (user) {
            const index = user.rooms.indexOf(roomId);
            if (index !== -1) user.rooms.splice(index, 1);
        }
        return;
    }

    if (parsedData.type === "chat") {
        if (!Number.isInteger(roomId) || roomId <= 0) return;
        const { message } = parsedData;
        if (!message) return;
        try {
            if (message.shape !== "eraser") {
                await prismaClient.chat.create({
                    data: { roomId, message, userId }
                });
            }
        } catch (error) {
            logger.error({ err: error, roomId, userId }, "Failed to persist message");
            return;
        }
        broadcast(roomId, userId, message);
    }
}
