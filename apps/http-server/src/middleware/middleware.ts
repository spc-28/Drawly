import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../types/requestType";
import { JWT_SECRET} from "@repo/backend-common/config";

export default function authMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization || req.headers["Authorization"] || null;

    if(!auth && !auth?.startsWith("Bearer")){
        return res.status(400).json({
            message: "Wrong Credentials"
        })
    }

    const token = (auth as string).split(' ')[1];

    try {
        const { userId } : any = jwt.verify(String(token), JWT_SECRET);
        req.userId = userId;
        next();
    } 
    catch (error) {
        return res.status(400).json({
            message: "Authentication Failed",
            error
        })

    }
    
}