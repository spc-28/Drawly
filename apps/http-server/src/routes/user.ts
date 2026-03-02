import { Router } from "express";
import { signIn, signUp } from "../controllers/user.js";
import  authMiddleware  from "../middleware/middleware.js";

export const userRouter: Router = Router();

userRouter.post('/signUp', signUp);
userRouter.post('/signIn', signIn);