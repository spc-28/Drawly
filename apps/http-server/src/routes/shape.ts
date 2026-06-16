import { Router } from "express";
import authMiddleware from "../middleware/middleware.js";
import { getShapes } from "../controllers/shape.js";

export const shapeRouter: Router = Router();

shapeRouter.get('/:roomId', authMiddleware as any, getShapes as any);
