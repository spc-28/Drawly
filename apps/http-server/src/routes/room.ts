import { Router } from "express";
import authMiddleware from "../middleware/middleware";
import { createRoom } from "../controllers/room";


export const roomRouter: Router = Router();

roomRouter.post('/createRoom', authMiddleware as any, createRoom as any);