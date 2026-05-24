import { Response } from "express";
import { CustomRequest } from "../types/requestType.js";
import { prismaClient } from "@repo/db/client";
import { logger } from "../logger.js";

export async function getChats(req: CustomRequest, res: Response) {
    const roomId = Number(req.params.roomId);

    if (!Number.isInteger(roomId) || roomId <= 0) {
        res.status(400).json({ message: "Invalid room ID" });
        return;
    }

    try {
        const room = await prismaClient.room.findUnique({ where: { id: roomId } });
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const messages = await prismaClient.chat.findMany({
            where: { roomId },
            orderBy: { id: "desc" },
            take: 50
        })

        res.status(200).json({ messages })
        return;
    }
    catch(error) {
        logger.error({ err: error }, "getChats error");
        res.status(500).json({ message: "Unable to fetch messages" })
        return;
    }
}

export async function deleteChat(req: CustomRequest, res: Response) {
    const { code } = req.body;
    const userId = req.userId;

    if (!code || typeof code !== "string") {
        res.status(400).json({ message: "Invalid code" });
        return;
    }

    try{
        const chat = await prismaClient.chat.deleteMany({
            where:{
                userId,
                message: {
                    path: ['code'],
                    equals: code,
                }
            }
        })
        res.status(200).json({ chat })
        return;
    }
    catch(error){
        logger.error({ err: error }, "deleteChat error");
        res.status(500).json({ message: "Unable to delete message" })
        return;
    }
}