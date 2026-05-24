import 'dotenv/config';
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const HTTP_LINK = "http://localhost:8000";

export const WS_LINK =  "ws://localhost:8080";

export const HTTP_PORT = process.env.HTTP_PORT || 8000;

export const WS_PORT = process.env.WS_PORT || 8080;

export function checkUser(token: string): string | null {
    try {
        const { userId }: any = jwt.verify(token, JWT_SECRET);
        if (userId) {
            return userId;
        } else {
            throw new Error("Unable to verify");
        }
    } catch (error) {
        return null;
    }
}