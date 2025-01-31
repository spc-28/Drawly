import 'dotenv/config';

export const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const HTTP_PORT = process.env.HTTP_PORT || 8000;

export const WS_PORT = process.env.WS_PORT || 8080;