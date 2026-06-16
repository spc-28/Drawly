import { Router } from "express";
import { userRouter } from "./user.js";
import { roomRouter } from "./room.js";
import { shapeRouter } from "./shape.js";

export const router: Router = Router();

router.use('/user', userRouter);
router.use('/room', roomRouter)
router.use('/shape', shapeRouter)