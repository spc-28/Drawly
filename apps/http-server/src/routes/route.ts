import { Router } from "express";
import { userRouter } from "./user.js";
import { roomRouter } from "./room.js";
import { chatRouter } from "./chat.js";

export const router: Router = Router();

router.use('/user', userRouter);
router.use('/room', roomRouter)
router.use('/chat', chatRouter)