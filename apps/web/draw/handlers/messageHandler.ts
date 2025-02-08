import { Circle, Eraser, Line, Rectangle } from "../types/shape";
import DrawRoom from "../drawRoom";
import { render } from "./renderer";

export class MessageHandler {
    private drawRoom: DrawRoom;

    constructor(drawRoom: DrawRoom) {
        this.drawRoom = drawRoom;

        drawRoom.getWs().onmessage = (e: MessageEvent) => {
                const data = JSON.parse(e.data);

                if (data.shape == "rectangle") {
                    drawRoom.setRectangles(data);
                }
                else if (data.shape == "circle") {
                    drawRoom.setCircles(data);
                }
                else if (data.shape == "line") {
                    drawRoom.setLines(data);
                }
                else if (data.shape == "text") {
                    drawRoom.setTexts(data);
                }
                else if (data.shape == "eraser") {
                    drawRoom.eraser(data.x, data.y);
                }
                else {
                    data.map((e: Line) => drawRoom.setPathData(e))
                }
                drawRoom.clearCanvasV();
                render(drawRoom);
        }
    }

    sendMessage(message: Rectangle | Circle | Text | Line | Line[] | Eraser) {
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