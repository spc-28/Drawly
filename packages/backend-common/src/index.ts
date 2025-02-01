import 'dotenv/config';

export const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const HTTP_LINK = "http://ec2-3-110-56-8.ap-south-1.compute.amazonaws.com:8000";

export const WS_LINK =  "ws://ec2-3-110-56-8.ap-south-1.compute.amazonaws.com:8080";

export const HTTP_PORT = process.env.HTTP_PORT || 8000;

export const WS_PORT = process.env.WS_PORT || 8080;