import { WebSocketServer } from "ws";
import { WS_PORT } from "@repo/backend-common/config";
import { handleConnection } from "./handlers/connectionHandler.js";
import { getUsers, removeUser, localBroadcast } from "./store/userStore.js";
import { connectPubSub, closePubSub } from "./redis/pubsub.js";
import { closeQueue } from "./redis/queue.js";
import { logger } from "./logger.js";

const server = new WebSocketServer({ port: Number(WS_PORT) });

server.on("connection", handleConnection);

await connectPubSub(localBroadcast);

const HEARTBEAT_INTERVAL_MS = 30_000;

const heartbeat = setInterval(() => {
    for (const user of getUsers()) {
        if (!user.isAlive) {
            logger.warn({ userId: user.userId }, "Terminating zombie connection");
            removeUser(user.socket);
            user.socket.terminate();
            continue;
        }
        user.isAlive = false;
        user.socket.ping();
    }
}, HEARTBEAT_INTERVAL_MS);

logger.info({ port: WS_PORT }, "WS server running");

async function shutdown(signal: string) {
    logger.info({ signal }, "Shutting down gracefully");
    clearInterval(heartbeat);

    for (const user of getUsers()) {
        user.socket.close(1001, "Server shutting down");
    }

    await Promise.all([closePubSub(), closeQueue()]);

    server.close(() => {
        logger.info("WS server closed");
        process.exit(0);
    });

    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
