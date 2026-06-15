import { WebSocket } from "ws";
import { User } from "../types/userType.js";
import { logger } from "../logger.js";

const users: User[] = [];

export function addUser(socket: WebSocket, userId: string): void {
    users.push({ socket, userId, rooms: [], isAlive: true });
}

export function removeUser(socket: WebSocket): void {
    const index = users.findIndex(u => u.socket === socket);
    if (index !== -1) users.splice(index, 1);
}

export function getUser(socket: WebSocket): User | undefined {
    return users.find(u => u.socket === socket);
}

export function getUsers(): User[] {
    return users;
}

export function localBroadcast(roomId: number, senderId: string, message: object): void {
    const payload = JSON.stringify(message);
    users.forEach(user => {
        if (user.rooms.includes(roomId) && user.userId !== senderId) {
            if (user.socket.readyState !== WebSocket.OPEN) return;
            try {
                user.socket.send(payload);
            } catch (error) {
                logger.error({ err: error, userId: user.userId }, "Broadcast send failed");
            }
        }
    });
}
