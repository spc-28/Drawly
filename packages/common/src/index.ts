import { z } from "zod";
import { JWT_SECRET } from "@repo/backend-common/config";
import  jwt  from "jsonwebtoken";

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
    slug: z.string()
})


export function checkUser(token: string): string | null {
    try{
        const { userId }: any = jwt.verify(token, JWT_SECRET);
        if(userId){
            return userId;
        }
        else{
            throw new Error("Unable to verify");
        }
    }
    catch(error) {
        return null;
    }

}