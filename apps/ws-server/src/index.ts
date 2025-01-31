import { WebSocketServer } from "ws";
import { WS_PORT } from "@repo/backend-common/config";
import { User } from "./types/userType";
import { prismaClient } from "@repo/db/client";
import { checkUser } from "@repo/common/check";

const ws = new WebSocketServer({port: Number(WS_PORT)});

const users: User[] = [];

ws.on("connection", (socket, request)=>{
    console.log("user connected");

    const url = request.url;
    const param = new URLSearchParams(url?.split('?')[1]);
    const token = param.get('token') || "";
    const userId = checkUser(token);

    if(!userId){
        socket.close();
        return null;
    }

    users.push({
        socket,
        userId,
        rooms: []
    })

    socket.on('message',async (data)=> {
        const parsedData = JSON.parse(data as any);

        if(parsedData.type == 'join') {
            const user = users.find(u=>u.socket===socket);
            
            //@ts-ignore
            if(user && !user.rooms.includes(parsedData.roomId))
            //@ts-ignore
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type == 'leave') {
            const user = users.find(u=>u.socket===socket);
            if(user){
                if (Array.isArray(user?.rooms)) {
                    //@ts-ignore
                    const index = user.rooms.indexOf(parsedData.roomId);
                
                    console.log('Index:', index);
                
                    if (index !== -1) {
                        user.rooms.splice(index, 1);
                        console.log('Updated rooms:', user.rooms);
                    } 
                    else {
                        console.log('Room not found:', parsedData.roomId);
                    }
                } 
                else {
                    console.log('user.rooms is not an array or undefined');
                }
            }
            
        }

        if(parsedData.type == 'chat') {
            const { roomId, message } = parsedData;
            try{
                if(message.shape!="eraser"){
                    await prismaClient.chat.create({
                    data:{
                        roomId,
                        message,
                        userId
                    }
                })
                }
            }
            catch(error) {
                console.log(error);
                return;
            }

            users.forEach((user)=>{
                //@ts-ignore
                if(user.rooms.includes(roomId)){
                    if(user.userId!==userId){
                        user.socket.send(JSON.stringify(message));
                    }
                }
            })
            
        }
    })
})