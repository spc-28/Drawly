import { Router } from "express";
import { signIn, signUp } from "../controllers/user";
import  authMiddleware  from "../middleware/middleware";

export const userRouter: Router = Router();

userRouter.post('/signUp', signUp);
userRouter.post('/signIn', authMiddleware as any, signIn);