import { drawCircle, drawLine, drawPencil, drawRectangle, writeText } from "../utils/drawing";
import { getRandomHexColor } from "../utils/virtual";
import DrawRoom from "../drawRoom";
import { render } from "./renderer";

export class EventHandlers {
    private drawRoom: DrawRoom;
    private pencilCode: string = "";

    constructor(drawRoom: DrawRoom) {
            this.drawRoom = drawRoom;

            this.drawRoom.getCanvas().addEventListener('mousedown', this.mouseDown);
            this.drawRoom.getCanvas().addEventListener('mousemove', this.mouseMove);
            this.drawRoom.getCanvas().addEventListener('mouseup', this.mouseUp);

            console.log(this.drawRoom.getPointerStatus());

    }

    mouseDown = (event: MouseEvent)=> {
        this.drawRoom.setPointerStatus(true);
        this.drawRoom.setInitX(event.clientX);
        this.drawRoom.setInitY(event.clientY);

        if (this.drawRoom.getTool() == "Pencil" || this.drawRoom.getTool() == "Line") {
            this.drawRoom.getCtx().fillStyle = this.drawRoom.getColor() || "#ffffff";
            this.pencilCode = getRandomHexColor();
        }
    }

    mouseMove = (event: MouseEvent) => {
        if (this.drawRoom.getPointerStatus()) {
            if (this.drawRoom.getTool() == "Pencil") {
                const pencil = {
                    x: this.drawRoom.getInitX(),
                    y: this.drawRoom.getInitY(),
                    toX: event.clientX,
                    toY: event.clientY,
                    shape: "pencil",
                    color: this.drawRoom.getColor(),
                    code: this.pencilCode
                }

                const arr = drawPencil(this.drawRoom.getCtx(), pencil);
                this.drawRoom.setInitX(arr[0]);
                this.drawRoom.setInitY(arr[1]);
                this.drawRoom.setPathData(pencil);
            }

            else if (this.drawRoom.getTool() == "Rectangle") {
                render(this.drawRoom);
                const rect = {
                    x: this.drawRoom.getInitX(),
                    y: this.drawRoom.getInitY(),
                    width: event.clientX - this.drawRoom.getInitX(),
                    height: event.clientY - this.drawRoom.getInitY(),
                    shape: "rectangle",
                    color: this.drawRoom.getColor()
                }
                drawRectangle(this.drawRoom.getCtx(), rect);
            }
            else if (this.drawRoom.getTool() == "Circle") {
                render(this.drawRoom);
                const circle = {
                    x: this.drawRoom.getInitX(),
                    y: this.drawRoom.getInitY(),
                    radius: event.clientX - this.drawRoom.getInitX(),
                    shape: "circle",
                    color: this.drawRoom.getColor()
                }
                drawCircle(this.drawRoom.getCtx(), circle);
            }

            else if (this.drawRoom.getTool() == "Line") {
                render(this.drawRoom);
                const line = {
                    x: this.drawRoom.getInitX(),
                    y: this.drawRoom.getInitY(),
                    toX: event.clientX,
                    toY: event.clientY,
                    shape: "line",
                    color: this.drawRoom.getColor()
                }
                drawLine(this.drawRoom.getCtx(), line);
            }
        }
    }

    mouseUp = (event: MouseEvent) =>{
        this.drawRoom.setPointerStatus(false);

        if (this.drawRoom.getTool() == "Rectangle") {
            const rect = {
                x: this.drawRoom.getInitX(),
                y: this.drawRoom.getInitY(),
                width: event.clientX - this.drawRoom.getInitX(),
                height: event.clientY - this.drawRoom.getInitY(),
                shape: "rectangle",
                color: this.drawRoom.getColor(),
                code: getRandomHexColor()
            }
            this.drawRoom.setRectangles(rect);
            this.drawRoom.messageHandler.sendMessage(rect);
        }

        else if (this.drawRoom.getTool() == "Eraser") {
            const x = event.clientX;
            const y = event.clientY;
            this.drawRoom.eraser(x, y);
        }

        else if (this.drawRoom.getTool() == "Text") {
            const text = {
                x: this.drawRoom.getInitX(),
                y: this.drawRoom.getInitY(),
                shape: "text",
                text: String(prompt("Enter the Text")),
                color: this.drawRoom.getColor(),
                code: getRandomHexColor()
            }
            this.drawRoom.setTexts(text);
            writeText(this.drawRoom.getCtx(), text);
            this.drawRoom.messageHandler.sendMessage(text);
        }
        else if (this.drawRoom.getTool() == "Circle") {
            const circle = {
                x: this.drawRoom.getInitX(),
                y: this.drawRoom.getInitY(),
                radius: event.clientX - this.drawRoom.getInitX(),
                shape: "circle",
                color: this.drawRoom.getColor(),
                code: getRandomHexColor()
            }
            this.drawRoom.setCircles(circle);
            this.drawRoom.messageHandler.sendMessage(circle);
        }
        else if (this.drawRoom.getTool() == "Line") {
            const line = {
                x: this.drawRoom.getInitX(),
                y: this.drawRoom.getInitY(),
                toX: event.clientX,
                toY: event.clientY,
                shape: "line",
                color: this.drawRoom.getColor(),
                code: getRandomHexColor()
            }
            this.drawRoom.setLines(line);
            this.drawRoom.messageHandler.sendMessage(line);
        }
        else if (this.drawRoom.getTool() == "Pencil") {
            const pencil = {
                x: this.drawRoom.getInitX(),
                y: this.drawRoom.getInitY(),
                toX: event.clientX,
                toY: event.clientY,
                shape: "pencil",
                color: this.drawRoom.getColor(),
                code: this.pencilCode
            }
            this.drawRoom.setPathData(pencil);
            this.drawRoom.messageHandler.sendMessage(this.drawRoom.getPathData());
        }
    }

    kill = () => {
        this.drawRoom.getCanvas().removeEventListener("mousedown", this.mouseDown);
        this.drawRoom.getCanvas().removeEventListener("mouseup", this.mouseUp);
        this.drawRoom.getCanvas().removeEventListener("mousemove", this.mouseMove);
    }
}