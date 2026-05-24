import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../types/requestType.js";
import { JWT_SECRET} from "@repo/backend-common/config";

export default function authMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization || null;

    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Missing or malformed authorization header"
        })
    }

    const token = auth.split(' ')[1];

    try {
        const payload = jwt.verify(token as string, JWT_SECRET) as unknown as { userId: string };
        req.userId = payload.userId;
        next();
    }
    catch {
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }

}