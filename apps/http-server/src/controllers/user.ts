import { Request, Response } from "express";
import { CreateUserSchema, SignInSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";
import { logger } from "../logger.js";

const SALT_ROUNDS = 12;

export async function signUp(req:Request, res: Response) {
    const { data, success } = CreateUserSchema.safeParse(req.body);

    if(!success) {
        res.status(400).json({
            message: "Invalid Inputs"
        })
        return;
    }
    try {
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await prismaClient.user.create({
            data: {
                ...data,
                password: hashedPassword
            }
        })

        const token = jwt.sign({userId: user?.id}, JWT_SECRET);

        res.status(200).json({
            token
        })
        return;
    }
    catch(error: any) {
        logger.error({ err: error }, "signUp error");
        res.status(400).json({
            message: "User creation Failed"
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

        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET);

        res.status(200).json({
            token
        })
        return;

    }
    catch(error) {
        logger.error({ err: error }, "signIn error");
        res.status(500).json({
            message: "Unable to sign in"
        })
        return;
    }

}