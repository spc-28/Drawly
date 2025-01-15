import { WebSocketServer } from "ws";
import { WS_PORT } from "@repo/backend-common/config";

const ws = new WebSocketServer({port: Number(WS_PORT)});

ws.on("connection", (socket)=>{
    console.log("user connected");
})