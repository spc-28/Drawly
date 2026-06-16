import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";
import { logger } from "../logger.js";

export const DB_WRITE_QUEUE = "db-writes";
export const PERSIST_SHAPE_JOB = "persist-shape";

export interface PersistShapePayload {
    roomId: number;
    userId: string;
    message: object;
}

let dbWriteQueue: Queue<PersistShapePayload>;

export function getQueue(): Queue<PersistShapePayload> {
    if (!dbWriteQueue) {
        dbWriteQueue = new Queue<PersistShapePayload>(DB_WRITE_QUEUE, {
            connection: redisConnection(),
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

export async function enqueueShapePersist(roomId: number, userId: string, message: object): Promise<void> {
    await getQueue().add(PERSIST_SHAPE_JOB, { roomId, userId, message });
}

export async function closeQueue(): Promise<void> {
    await dbWriteQueue?.close();
    logger.info("BullMQ queue closed");
}
