import { Response } from "express";
import { CustomRequest } from "../types/requestType";
import { prismaClient } from "@repo/db/client";

export async function getChats(req: CustomRequest, res: Response) {
    const roomId = Number(req.params.roomId);

    try {
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId
            },
            orderBy: {
                id: "desc"
            },
            take:50
        })

        res.status(200).json({
            messages
        })
        return;
    }
    catch(error) {
        res.status(400).json({
            message: "unable to fetch messages",
            error
        })
        return;
    }
}

export async function deleteChat(req: CustomRequest, res: Response) {
    const { code } = req.body;
    try{
        const chat = await prismaClient.chat.deleteMany({
            where:{
                message: {
                    path: ['code'],
                    equals: code,
                }
            }
        })
        res.status(200).json({
            chat
        })
        return;
    }
    catch(error){
        res.status(400).json({
            message: "unable to fetch messages",
            error
        })
        return;
    }
}