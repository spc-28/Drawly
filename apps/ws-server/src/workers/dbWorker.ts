import { Worker } from "bullmq";
import { prismaClient } from "@repo/db/client";
import { DB_WRITE_QUEUE, PERSIST_SHAPE_JOB, PersistShapePayload } from "../redis/queue.js";
import { logger } from "../logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const url = new URL(REDIS_URL);

const worker = new Worker<PersistShapePayload>(
    DB_WRITE_QUEUE,
    async (job) => {
        if (job.name !== PERSIST_SHAPE_JOB) return;

        const { roomId, userId, message } = job.data;
        const msg = message as { shape?: string; code?: string };
        const code = msg.code;
        if (!code) return;

        if (msg.shape === "eraser") {
            await prismaClient.shape.updateMany({
                where: { id: code, roomId },
                data: { deletedAt: new Date() },
            });
            logger.info({ roomId, userId, code, jobId: job.id }, "Shape soft-deleted");
            return;
        }

        await prismaClient.shape.upsert({
            where: { id: code },
            create: { id: code, roomId, userId, type: msg.shape ?? "unknown", data: message },
            update: { data: message, deletedAt: null },
        });

        logger.info({ roomId, userId, code, jobId: job.id }, "Shape persisted");
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
