import express from "express";
import { router } from "./routes/route.js";
import { HTTP_PORT } from "@repo/backend-common/config";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { logger } from "./logger.js";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "http://localhost:3000")
    .split(",")
    .map(o => o.trim());

const app = express();

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later" }
});

app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
}));
app.use(express.json());
app.use(generalLimiter);
app.use('/api/v1/user/signUp', authLimiter);
app.use('/api/v1/user/signIn', authLimiter);
app.use('/api/v1', router);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

const httpServer = app.listen(HTTP_PORT, () => logger.info(`Listening on Port ${HTTP_PORT}`));

function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down gracefully`);
    httpServer.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
    });

    // Force exit if connections hang beyond 10s
    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));