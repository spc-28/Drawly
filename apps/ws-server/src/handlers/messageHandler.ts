import { prismaClient } from "@repo/db/client";
import { broadcast, getUser } from "../store/userStore.js";
import { WebSocket } from "ws";

export async function handleMessage(socket: WebSocket, userId: string, data: any): Promise<void> {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "join") {
        const user = getUser(socket);
        if (user && !user.rooms.includes(parsedData.roomId)) {
            user.rooms.push(parsedData.roomId);
        }
        return;
    }

    if (parsedData.type === "leave") {
        const user = getUser(socket);
        if (user) {
            const index = user.rooms.indexOf(parsedData.roomId);
            if (index !== -1) user.rooms.splice(index, 1);
        }
        return;
    }

    if (parsedData.type === "chat") {
        const { roomId, message } = parsedData;
        try {
            if (message.shape !== "eraser") {
                await prismaClient.chat.create({
                    data: { roomId, message, userId }
                });
            }
        } catch (error) {
            console.error("Failed to persist message:", error);
            return;
        }
        broadcast(roomId, userId, message);
    }
}
