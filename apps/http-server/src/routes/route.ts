import { Router } from "express";
import { userRouter } from "./user";

export const router: Router = Router();

router.use('/user', userRouter);