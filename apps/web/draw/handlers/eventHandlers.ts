import { drawCircle, drawLine, drawPencil, drawRectangle, writeText } from "../utils/drawing";
import { getRandomHexColor } from "../utils/virtual";
import DrawRoom from "../drawRoom";
import { render } from "./renderer";

export class EventHandlers {
    private drawRoom: DrawRoom;
    private pencilCode: string = "";
    private isPanning: boolean = false;
    private lastPanX: number = 0;
    private lastPanY: number = 0;
    private isSpaceDown: boolean = false;

    constructor(drawRoom: DrawRoom) {
            this.drawRoom = drawRoom;

            this.drawRoom.getCanvas().addEventListener('mousedown', this.mouseDown);
            this.drawRoom.getCanvas().addEventListener('mousemove', this.mouseMove);
            this.drawRoom.getCanvas().addEventListener('mouseup', this.mouseUp);
            this.drawRoom.getCanvas().addEventListener('mouseleave', this.mouseLeave);
            this.drawRoom.getCanvas().addEventListener('wheel', this.wheel, { passive: false });
            window.addEventListener('keydown', this.keyDown);
            window.addEventListener('keyup', this.keyUp);

            console.log(this.drawRoom.getPointerStatus());

    }

    private updateCursor(): void {
        const canvas = this.drawRoom.getCanvas();
        if (this.isPanning) {
            canvas.style.cursor = 'grabbing';
        } else if (this.isSpaceDown || this.drawRoom.getTool() === 'Hand') {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'crosshair';
        }
    }

    refreshCursor(): void {
        this.updateCursor();
    }

    keyDown = (event: KeyboardEvent) => {
        if (event.code === 'Space' && !this.isSpaceDown) {
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement).tagName)) return;
            event.preventDefault();
            this.isSpaceDown = true;
            this.updateCursor();
        }
    }

    keyUp = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
            this.isSpaceDown = false;
            this.isPanning = false;
            this.updateCursor();
        }
    }

    mouseLeave = () => {
        if (this.isPanning && !this.isSpaceDown && this.drawRoom.getTool() !== 'Hand') {
            this.isPanning = false;
            this.updateCursor();
        }
    }

    private toWorldX(screenX: number): number {
        return this.drawRoom.toWorldX(screenX);
    }

    private toWorldY(screenY: number): number {
        return this.drawRoom.toWorldY(screenY);
    }

    wheel = (event: WheelEvent) => {
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.1 : 0.9;
        this.drawRoom.zoom(factor, event.clientX, event.clientY);
    }

    mouseDown = (event: MouseEvent)=> {
        // Middle mouse button OR Hand tool OR Space+drag → pan
        if (
            event.button === 1 ||
            (event.button === 0 && (this.isSpaceDown || this.drawRoom.getTool() === 'Hand'))
        ) {
            event.preventDefault();
            this.isPanning = true;
            this.lastPanX = event.clientX;
            this.lastPanY = event.clientY;
            this.updateCursor();
            return;
        }

        this.drawRoom.setPointerStatus(true);
        this.drawRoom.setInitX(this.toWorldX(event.clientX));
        this.drawRoom.setInitY(this.toWorldY(event.clientY));

        if (this.drawRoom.getTool() == "Pencil" || this.drawRoom.getTool() == "Line") {
            this.drawRoom.getCtx().fillStyle = this.drawRoom.getColor() || "#ffffff";
            this.pencilCode = getRandomHexColor();
        }
    }

    mouseMove = (event: MouseEvent) => {
        // Pan (middle mouse, Hand tool, or Space)
        if (this.isPanning) {
            const dx = event.clientX - this.lastPanX;
            const dy = event.clientY - this.lastPanY;
            this.lastPanX = event.clientX;
            this.lastPanY = event.clientY;
            this.drawRoom.pan(dx, dy);
            return;
        }

        if (this.drawRoom.getPointerStatus()) {
            if (this.drawRoom.getTool() == "Pencil") {
                const pencil = {
                    x: this.drawRoom.getInitX(),
                    y: this.drawRoom.getInitY(),
                    toX: this.toWorldX(event.clientX),
                    toY: this.toWorldY(event.clientY),
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
                    width: this.toWorldX(event.clientX) - this.drawRoom.getInitX(),
                    height: this.toWorldY(event.clientY) - this.drawRoom.getInitY(),
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
                    radius: this.toWorldX(event.clientX) - this.drawRoom.getInitX(),
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
                    toX: this.toWorldX(event.clientX),
                    toY: this.toWorldY(event.clientY),
                    shape: "line",
                    color: this.drawRoom.getColor()
                }
                drawLine(this.drawRoom.getCtx(), line);
            }

            else if (this.drawRoom.getTool() == "Eraser") {
                this.drawRoom.eraser(this.toWorldX(event.clientX), this.toWorldY(event.clientY));
            }
        }
    }

    mouseUp = (event: MouseEvent) =>{
        // End panning
        if (this.isPanning) {
            this.isPanning = false;
            this.updateCursor();
            return;
        }

        this.drawRoom.setPointerStatus(false);

        if (this.drawRoom.getTool() == "Rectangle") {
            const rect = {
                x: this.drawRoom.getInitX(),
                y: this.drawRoom.getInitY(),
                width: this.toWorldX(event.clientX) - this.drawRoom.getInitX(),
                height: this.toWorldY(event.clientY) - this.drawRoom.getInitY(),
                shape: "rectangle",
                color: this.drawRoom.getColor(),
                code: getRandomHexColor()
            }
            this.drawRoom.setRectangles(rect);
            this.drawRoom.messageHandler.sendMessage(rect);
        }

        else if (this.drawRoom.getTool() == "Eraser") {
            this.drawRoom.eraser(this.toWorldX(event.clientX), this.toWorldY(event.clientY));
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
                radius: this.toWorldX(event.clientX) - this.drawRoom.getInitX(),
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
                toX: this.toWorldX(event.clientX),
                toY: this.toWorldY(event.clientY),
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
                toX: this.toWorldX(event.clientX),
                toY: this.toWorldY(event.clientY),
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
        this.drawRoom.getCanvas().removeEventListener("mouseleave", this.mouseLeave);
        this.drawRoom.getCanvas().removeEventListener("wheel", this.wheel);
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('keyup', this.keyUp);
    }
}