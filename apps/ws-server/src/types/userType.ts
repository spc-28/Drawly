import { WebSocket } from "ws";

export interface User {
    socket: WebSocket,
    rooms: [],
    userId: string
}