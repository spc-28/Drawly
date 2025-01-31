"use client"

import { WS_PORT } from "@repo/backend-common/config";
import { useEffect, useState } from "react";
import Canvas from "./canvas";

export default function Room({ roomId }:{ roomId: number }) {
    const [ws, setWs] = useState<WebSocket>();

    useEffect(()=>{
        const wss = new WebSocket(`ws://localhost:${WS_PORT}/?token=${localStorage.getItem('token')}`);
        
        wss.onopen = ()=>{
            wss.send(JSON.stringify({
                type: "join",
                roomId
            }))
            setWs(wss);
        }
        return(()=>wss.close())

    },[])

    if(!ws){
        return <div>Connecting to server...</div>;
    }

    return <Canvas ws={ws} roomId={roomId}/>
}