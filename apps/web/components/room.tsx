"use client"

import { WS_LINK } from "@repo/backend-common/config";
import { useEffect, useState } from "react";
import Canvas from "./canvas";

export default function Room({ roomId }:{ roomId: number }) {
    const [ws, setWs] = useState<WebSocket>();

    useEffect(()=>{
        const wss = new WebSocket(`${WS_LINK}/?token=${localStorage.getItem('token')}`);
        
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