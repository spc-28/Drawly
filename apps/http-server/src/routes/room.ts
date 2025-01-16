import { Router } from "express";
import authMiddleware from "../middleware/middleware";
import { createRoom, getRoom } from "../controllers/room";


export const roomRouter: Router = Router();

roomRouter.post('/createRoom', authMiddleware as any, createRoom as any);
roomRouter.get('/:slug', authMiddleware as any, getRoom as any);