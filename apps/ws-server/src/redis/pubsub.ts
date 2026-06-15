import { Redis } from "ioredis";
import { logger } from "../logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const CHANNEL_PREFIX = "room:";

type BroadcastCallback = (roomId: number, senderId: string, message: object) => void;

let publisher!: Redis;
let subscriber!: Redis;
let broadcastCallback!: BroadcastCallback;

export async function connectPubSub(onMessage: BroadcastCallback): Promise<void> {
    broadcastCallback = onMessage;

    publisher = new Redis(REDIS_URL, { lazyConnect: true });
    subscriber = new Redis(REDIS_URL, { lazyConnect: true });

    await Promise.all([publisher.connect(), subscriber.connect()]);

    subscriber.on("pmessage", (_pattern: string, channel: string, raw: string) => {
        try {
            const roomId = Number(channel.slice(CHANNEL_PREFIX.length));
            const { senderId, message } = JSON.parse(raw);
            broadcastCallback(roomId, senderId, message);
        } catch (err) {
            logger.error({ err }, "Failed to handle Redis pub/sub message");
        }
    });

    await subscriber.psubscribe(`${CHANNEL_PREFIX}*`);
    logger.info("Redis pub/sub connected, subscribed to room:*");
}

export async function publish(roomId: number, senderId: string, message: object): Promise<void> {
    const payload = JSON.stringify({ senderId, message });
    await publisher.publish(`${CHANNEL_PREFIX}${roomId}`, payload);
}

export async function closePubSub(): Promise<void> {
    await subscriber.punsubscribe(`${CHANNEL_PREFIX}*`);
    publisher.disconnect();
    subscriber.disconnect();
    logger.info("Redis pub/sub disconnected");
}
