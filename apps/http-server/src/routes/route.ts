import { Router } from "express";
import { userRouter } from "./user";
import { roomRouter } from "./room";
import { chatRouter } from "./chat";

export const router: Router = Router();

router.use('/user', userRouter);
router.use('/room', roomRouter)
router.use('/chat', chatRouter)