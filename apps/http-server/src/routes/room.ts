import { Router } from "express";
import authMiddleware from "../middleware/middleware.js";
import { createRoom } from "../controllers/room.js";


export const roomRouter: Router = Router();

roomRouter.post('/createRoom', authMiddleware as any, createRoom as any);