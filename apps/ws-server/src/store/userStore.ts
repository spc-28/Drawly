import { WebSocket } from "ws";
import { User } from "../types/userType.js";

const users: User[] = [];

export function addUser(socket: WebSocket, userId: string): void {
    users.push({ socket, userId, rooms: [] });
}

export function removeUser(socket: WebSocket): void {
    const index = users.findIndex(u => u.socket === socket);
    if (index !== -1) users.splice(index, 1);
}

export function getUser(socket: WebSocket): User | undefined {
    return users.find(u => u.socket === socket);
}

export function broadcast(roomId: number, senderId: string, message: object): void {
    users.forEach(user => {
        if (user.rooms.includes(roomId) && user.userId !== senderId) {
            user.socket.send(JSON.stringify(message));
        }
    });
}
