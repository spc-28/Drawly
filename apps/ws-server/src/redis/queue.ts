import { Queue } from "bullmq";
import { logger } from "../logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const DB_WRITE_QUEUE = "db-writes";
export const PERSIST_CHAT_JOB = "persist-chat";

export interface PersistChatPayload {
    roomId: number;
    userId: string;
    message: object;
}

let dbWriteQueue: Queue<PersistChatPayload>;

export function getQueue(): Queue<PersistChatPayload> {
    if (!dbWriteQueue) {
        const url = new URL(REDIS_URL);
        dbWriteQueue = new Queue<PersistChatPayload>(DB_WRITE_QUEUE, {
            connection: {
                host: url.hostname,
                port: Number(url.port) || 6379,
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: "exponential", delay: 1000 },
                removeOnComplete: 100,
                removeOnFail: 500,
            },
        });
    }
    return dbWriteQueue;
}

export async function enqueueChatPersist(roomId: number, userId: string, message: object): Promise<void> {
    await getQueue().add(PERSIST_CHAT_JOB, { roomId, userId, message });
}

export async function closeQueue(): Promise<void> {
    await dbWriteQueue?.close();
    logger.info("BullMQ queue closed");
}
