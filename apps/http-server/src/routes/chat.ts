import { Router } from "express";
import authMiddleware from "../middleware/middleware";
import { deleteChat, getChats } from "../controllers/chat";


export const chatRouter: Router = Router();

chatRouter.get('/:roomId', authMiddleware as any, getChats as any);
chatRouter.delete('/', authMiddleware as any, deleteChat as any);