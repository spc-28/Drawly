import { Toaster } from "react-hot-toast";
import Room from "../../../components/room";

export default async function Draw({ params }: { params:{ roomId:string } }) {
    const { roomId } = await params;
    
    return(
        <>
            <Room roomId={Number(roomId)}/>
            <div><Toaster/></div>
        </>
    )
}