import { Toaster } from "react-hot-toast";
import Room from "../../../components/room";

type tParams = Promise<{ roomId: string }>;

export default async function Draw({ params }: { params:tParams }) {

    const { roomId } = await params;
    
    return(
        <>
            <Room roomId={Number(roomId)}/>
            <div><Toaster/></div>
        </>
    )
}