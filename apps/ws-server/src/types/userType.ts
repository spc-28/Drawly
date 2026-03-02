import { WebSocket } from "ws";

export interface User {
    socket: WebSocket;
    rooms: number[];
    userId: string;
}