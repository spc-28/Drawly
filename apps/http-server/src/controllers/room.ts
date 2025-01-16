import { Response } from "express";
import { CustomRequest } from "../types/requestType";
import { createRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

export async function createRoom(req: CustomRequest, res: Response) {
    const { data, success } = createRoomSchema.safeParse(req.body);

    if(!success){
        res.status(400).json({
            message: "Invalid Inputs"
        })
        return;
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                adminId: req.userId as string,
                slug: data.slug
            }
        })
        res.status(200).json({
            room
        })
        return; 
    }
    catch(error) {
        res.status(400).json({
            message: "Room creation Failed",
            error
        })
        return;
    }
}

export async function getRoom(req: CustomRequest, res: Response) {
    const slug = req.params.slug;

    try {
        const room = await prismaClient.room.findFirst({
            where: {
                slug
            }
        });

        if(room == null){
            throw new Error("Room not present");
        }

        res.status(200).json({
            message: "room received",
            room
        })
        return;
    }
    catch(error) {
        res.status(400).json({
            message: "Unable to get room",
            error
        })
    }
}