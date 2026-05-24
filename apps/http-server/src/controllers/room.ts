import { Response } from "express";
import { CustomRequest } from "../types/requestType.js";
import { prismaClient } from "@repo/db/client";
import { logger } from "../logger.js";

export async function createRoom(req: CustomRequest, res: Response) {

    try {
        const room = await prismaClient.room.create({
            data: {
                adminId: req.userId as string,
            }
        })
        res.status(200).json({ room })
        return;
    }
    catch(error) {
        logger.error({ err: error }, "createRoom error");
        res.status(500).json({ message: "Room creation failed" })
        return;
    }
}

// export async function getRoom(req: CustomRequest, res: Response) {
//     const slug = req.params.slug;

//     try {
//         const room = await prismaClient.room.findFirst({
//             where: {
//                 slug
//             }
//         });

//         if(room == null){
//             throw new Error("Room not present");
//         }

//         res.status(200).json({
//             message: "room received",
//             room
//         })
//         return;
//     }
//     catch(error) {
//         res.status(400).json({
//             message: "Unable to get room",
//             error
//         })
//     }
// }