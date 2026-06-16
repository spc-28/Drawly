import { Circle, Eraser, Line, Pencil, Rectangle, Text } from "../types/shape";
import DrawRoom from "../drawRoom";
import { render } from "./renderer";

export class MessageHandler {
    private drawRoom: DrawRoom;

    constructor(drawRoom: DrawRoom) {
        this.drawRoom = drawRoom;

        drawRoom.getWs().onmessage = (e: MessageEvent) => {
                const data = JSON.parse(e.data);

                if (data.shape == "eraser") {
                    drawRoom.eraseByCode(data.code);
                }
                else {
                    drawRoom.upsertShapeLocal(data);
                }
                render(drawRoom);
        }
    }

    sendMessage(message: Rectangle | Circle | Text | Line | Pencil | Eraser) {
            this.drawRoom.getWs().send(JSON.stringify(
                {
                    message,
                    type: "chat",
                    roomId: this.drawRoom.getRoomId(),
                    userId: this.drawRoom.getUserId()
                }
            ));
    }
}