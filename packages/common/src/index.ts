import { z } from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(3).max(20),
    name: z.string().min(3),
    password: z.string()

})

export const SignInSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string()
})

export const createRoomSchema = z.object({
    roomName: z.string()
})