import { JWT_SECRET } from "@repo/backend-common/config";
import  jwt  from "jsonwebtoken";

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