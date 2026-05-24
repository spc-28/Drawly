import { drawCircle, drawLine, drawPencil, drawRectangle } from "../utils/drawing";
import { getRandomHexColor } from "../utils/virtual";
import { Eraser } from "../types/shape";
import DrawRoom from "../drawRoom";
import { render } from "./renderer";
import { findHitTextShape, findShapesInRect } from "../utils/hitTest";

export class EventHandlers {
    private drawRoom: DrawRoom;
    private pencilCode: string = "";
    private isPanning: boolean = false;
    private lastPanX: number = 0;
    private lastPanY: number = 0;
    private isSpaceDown: boolean = false;
    private cursorInterval: ReturnType<typeof setInterval> | null = null;
    private isSelecting: boolean = false;
    private isMovingSelection: boolean = false;
    private lastMoveX: number = 0;
    private lastMoveY: number = 0;

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
        if (this.isMovingSelection) {
            canvas.style.cursor = 'move';
        } else if (this.isPanning) {
            canvas.style.cursor = 'grabbing';
        } else if (this.isSpaceDown || this.drawRoom.getTool() === 'Hand') {
            canvas.style.cursor = this.drawRoom.selectedCodes.size > 0 ? 'move' : 'grab';
        } else if (this.drawRoom.getTool() === 'Arrow') {
            canvas.style.cursor = 'default';
        } else {
            canvas.style.cursor = 'crosshair';
        }
    }

    refreshCursor(): void {
        this.updateCursor();
    }

    private startTyping(x: number, y: number): void {
        if (this.drawRoom.typingState) this.commitText();
        this.drawRoom.typingState = { x, y, lines: [""], cursorLine: 0, cursorVisible: true };
        this.cursorInterval = setInterval(() => {
            if (this.drawRoom.typingState) {
                this.drawRoom.typingState.cursorVisible = !this.drawRoom.typingState.cursorVisible;
                render(this.drawRoom);
            }
        }, 500);
        render(this.drawRoom);
    }

    private commitText(): void {
        const ts = this.drawRoom.typingState;
        if (!ts) return;
        if (this.cursorInterval) { clearInterval(this.cursorInterval); this.cursorInterval = null; }
        this.drawRoom.typingState = null;
        const joined = ts.lines.join('\n');
        if (joined.trim()) {
            const text = {
                x: ts.x, y: ts.y, shape: "text", text: joined,
                color: this.drawRoom.getColor(), code: getRandomHexColor()
            };
            this.drawRoom.setTexts(text);
            this.drawRoom.messageHandler.sendMessage(text);
        }
        render(this.drawRoom);
    }

    private cancelText(): void {
        if (this.cursorInterval) { clearInterval(this.cursorInterval); this.cursorInterval = null; }
        this.drawRoom.typingState = null;
        render(this.drawRoom);
    }

    keyDown = (event: KeyboardEvent) => {
        if (this.drawRoom.typingState) {
            const ts = this.drawRoom.typingState;
            if (event.key === 'Enter') {
                ts.lines.splice(ts.cursorLine + 1, 0, "");
                ts.cursorLine += 1;
                ts.cursorVisible = true;
                render(this.drawRoom);
            } else if (event.key === 'Escape') {
                this.cancelText();
            } else if (event.key === 'Backspace') {
                const currentLine = ts.lines[ts.cursorLine] ?? "";
                if (currentLine.length > 0) {
                    ts.lines[ts.cursorLine] = currentLine.slice(0, -1);
                } else if (ts.cursorLine > 0) {
                    ts.lines.splice(ts.cursorLine, 1);
                    ts.cursorLine -= 1;
                }
                ts.cursorVisible = true;
                render(this.drawRoom);
            } else if (event.key.length === 1) {
                ts.lines[ts.cursorLine] += event.key;
                ts.cursorVisible = true;
                render(this.drawRoom);
            }
            event.preventDefault();
            return;
        }
        if (event.key === 'Escape' && !this.drawRoom.typingState) {
            this.drawRoom.clearSelection();
            render(this.drawRoom);
            return;
        }
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
        if (this.drawRoom.typingState) {
            this.commitText();
            // Don't return — let the click update initX/Y so mouseUp gets fresh coords
        }

        const tool = this.drawRoom.getTool();

        // Hand tool + existing selection → move selection instead of pan
        if (event.button === 0 && (this.isSpaceDown || tool === 'Hand') && this.drawRoom.selectedCodes.size > 0) {
            event.preventDefault();
            this.isMovingSelection = true;
            this.lastMoveX = event.clientX;
            this.lastMoveY = event.clientY;
            this.updateCursor();
            return;
        }

        // Middle mouse button OR Hand tool OR Space+drag → pan
        if (
            event.button === 1 ||
            (event.button === 0 && (this.isSpaceDown || tool === 'Hand'))
        ) {
            event.preventDefault();
            this.isPanning = true;
            this.lastPanX = event.clientX;
            this.lastPanY = event.clientY;
            this.updateCursor();
            return;
        }

        // Arrow tool → start drag selection
        if (event.button === 0 && tool === 'Arrow') {
            this.drawRoom.clearSelection();
            const wx = this.toWorldX(event.clientX);
            const wy = this.toWorldY(event.clientY);
            this.drawRoom.setInitX(wx);
            this.drawRoom.setInitY(wy);
            this.drawRoom.selectionRect = { x: wx, y: wy, width: 0, height: 0 };
            this.isSelecting = true;
            render(this.drawRoom);
            return;
        }

        this.drawRoom.setPointerStatus(true);
        this.drawRoom.setInitX(this.toWorldX(event.clientX));
        this.drawRoom.setInitY(this.toWorldY(event.clientY));

        if (tool == "Pencil" || tool == "Line") {
            this.drawRoom.getCtx().fillStyle = this.drawRoom.getColor() || "#ffffff";
            this.pencilCode = getRandomHexColor();
        }
    }

    mouseMove = (event: MouseEvent) => {
        // Move selected shapes (Hand tool with selection)
        if (this.isMovingSelection) {
            const scale = this.drawRoom.getScale();
            const dx = (event.clientX - this.lastMoveX) / scale;
            const dy = (event.clientY - this.lastMoveY) / scale;
            this.lastMoveX = event.clientX;
            this.lastMoveY = event.clientY;
            this.drawRoom.moveSelectedShapes(dx, dy);
            return;
        }

        // Arrow tool drag → update selection rect
        if (this.isSelecting && this.drawRoom.selectionRect) {
            const wx = this.toWorldX(event.clientX);
            const wy = this.toWorldY(event.clientY);
            this.drawRoom.selectionRect.width = wx - this.drawRoom.getInitX();
            this.drawRoom.selectionRect.height = wy - this.drawRoom.getInitY();
            const sel = this.drawRoom.selectionRect;
            this.drawRoom.selectedCodes = findShapesInRect(
                this.drawRoom.getRectangles(), this.drawRoom.getCircles(),
                this.drawRoom.getLines(), this.drawRoom.getTexts(), this.drawRoom.getPathData(),
                sel.x, sel.y, sel.width, sel.height
            );
            render(this.drawRoom);
            return;
        }

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
                this.drawRoom.messageHandler.sendMessage(pencil);
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
        // End moving selection
        if (this.isMovingSelection) {
            this.isMovingSelection = false;
            this.updateCursor();
            return;
        }

        // End drag selection
        if (this.isSelecting) {
            this.isSelecting = false;
            this.drawRoom.selectionRect = null;
            render(this.drawRoom);
            this.updateCursor();
            return;
        }

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
            const wx = this.drawRoom.getInitX();
            const wy = this.drawRoom.getInitY();
            const hit = findHitTextShape(this.drawRoom.getTexts(), wx, wy);
            if (hit && hit.code) {
                this.drawRoom.removeText(hit.code);
                this.drawRoom.messageHandler.sendMessage({ shape: "eraser", code: hit.code } as Eraser);
                const lines = hit.text.split('\n');
                this.drawRoom.typingState = { x: hit.x, y: hit.y, lines, cursorLine: lines.length - 1, cursorVisible: true, originalText: hit };
                if (this.cursorInterval) clearInterval(this.cursorInterval);
                this.cursorInterval = setInterval(() => {
                    if (this.drawRoom.typingState) {
                        this.drawRoom.typingState.cursorVisible = !this.drawRoom.typingState.cursorVisible;
                        render(this.drawRoom);
                    }
                }, 500);
                render(this.drawRoom);
            } else {
                this.startTyping(wx, wy);
            }
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
    }

    kill = () => {
        if (this.cursorInterval) { clearInterval(this.cursorInterval); this.cursorInterval = null; }
        this.drawRoom.getCanvas().removeEventListener("mousedown", this.mouseDown);
        this.drawRoom.getCanvas().removeEventListener("mouseup", this.mouseUp);
        this.drawRoom.getCanvas().removeEventListener("mousemove", this.mouseMove);
        this.drawRoom.getCanvas().removeEventListener("mouseleave", this.mouseLeave);
        this.drawRoom.getCanvas().removeEventListener("wheel", this.wheel);
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('keyup', this.keyUp);
    }
}