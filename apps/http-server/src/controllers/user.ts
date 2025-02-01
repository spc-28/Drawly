import { Request, Response } from "express";
import { CreateUserSchema, SignInSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export async function signUp(req:Request, res: Response) {
    const { data, success } = CreateUserSchema.safeParse(req.body);

    if(!success) {
        res.status(400).json({
            message: "Invalid Inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: data
        })

        const token = jwt.sign({userId: user?.id}, JWT_SECRET);

        res.status(200).json({
            token
        })
        return; 
    }
    catch(error) {
        res.status(400).json({
            message: "User creation Failed",
            error
        })
        return;
    }

}

export async function signIn(req:Request, res: Response) {
    const { data, success } = SignInSchema.safeParse(req.body);

    if(!success) {
        res.status(400).json({
            message: "Invalid Inputs"
        })
        return;
    }

    try {
        const user = await prismaClient.user.findUnique({
            where:{
                username: data.username
            }
        })

        if(user?.password != data.password){
            throw new Error("Invalid Password");
        }

        const token = jwt.sign({userId: user?.id}, JWT_SECRET);

        res.status(200).json({
            token
        })
        return;
        
    }
    catch(error) {
        res.status(400).json({
            message: "unable to Sign In",
            error
        })
        return;
    }

}