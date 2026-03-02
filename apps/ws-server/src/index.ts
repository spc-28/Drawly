import { WebSocketServer } from "ws";
import { WS_PORT } from "@repo/backend-common/config";
import { handleConnection } from "./handlers/connectionHandler.js";

const server = new WebSocketServer({ port: Number(WS_PORT) });

server.on("connection", handleConnection);

console.log(`WS server running on port ${WS_PORT}`);
