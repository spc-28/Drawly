import { Router } from "express";
import authMiddleware from "../middleware/middleware.js";
import { deleteChat, getChats } from "../controllers/chat.js";


export const chatRouter: Router = Router();

chatRouter.get('/:roomId', authMiddleware as any, getChats as any);
chatRouter.delete('/', authMiddleware as any, deleteChat as any);