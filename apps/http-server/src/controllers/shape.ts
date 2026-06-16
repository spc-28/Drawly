import { Response } from "express";
import { CustomRequest } from "../types/requestType.js";
import { prismaClient } from "@repo/db/client";
import { logger } from "../logger.js";

export async function getShapes(req: CustomRequest, res: Response) {
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

        const shapes = await prismaClient.shape.findMany({
            where: { roomId, deletedAt: null },
            orderBy: { createdAt: "asc" },
        });

        res.status(200).json({ shapes });
        return;
    }
    catch (error) {
        logger.error({ err: error }, "getShapes error");
        res.status(500).json({ message: "Unable to fetch shapes" });
        return;
    }
}
