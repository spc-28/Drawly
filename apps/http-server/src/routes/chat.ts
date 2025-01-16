import { Router } from "express";
import authMiddleware from "../middleware/middleware";
import { getChats } from "../controllers/chat";


export const chatRouter: Router = Router();

chatRouter.get('/:roomId', authMiddleware as any, getChats as any);