import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

config();
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}

export const JWT_SECRET = process.env.JWT_SECRET;

export const HTTP_LINK = process.env.HTTP_LINK || "http://localhost:8000";

export const WS_LINK = process.env.WS_LINK || "ws://localhost:8080";

export const HTTP_PORT = process.env.HTTP_PORT || 8000;

export const WS_PORT = process.env.WS_PORT || 8080;

export function checkUser(token: string): string | null {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        return payload.userId ?? null;
    } catch {
        return null;
    }
}