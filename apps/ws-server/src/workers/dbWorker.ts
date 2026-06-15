import { Worker } from "bullmq";
import { prismaClient } from "@repo/db/client";
import { DB_WRITE_QUEUE, PERSIST_CHAT_JOB, PersistChatPayload } from "../redis/queue.js";
import { logger } from "../logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const url = new URL(REDIS_URL);

const worker = new Worker<PersistChatPayload>(
    DB_WRITE_QUEUE,
    async (job) => {
        if (job.name !== PERSIST_CHAT_JOB) return;

        const { roomId, userId, message } = job.data;
        const msg = message as { shape?: string };

        if (msg.shape === "eraser") return;

        await prismaClient.chat.create({
            data: { roomId, message, userId },
        });

        logger.info({ roomId, userId, jobId: job.id }, "Chat persisted");
    },
    {
        connection: {
            host: url.hostname,
            port: Number(url.port) || 6379,
        },
        concurrency: 1,
    }
);

worker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, attempt: job?.attemptsMade }, "DB write job failed");
});

worker.on("ready", () => {
    logger.info("DB worker ready, consuming from db-writes queue");
});

async function shutdown(signal: string) {
    logger.info({ signal }, "DB worker shutting down");
    await worker.close();
    await prismaClient.$disconnect();
    process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
