import { Rectangle, Circle, Line, Text, Shape } from "./types/shape";
function decodeUserId(token: string): string | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
        return payload.userId ?? null;
    } catch {
        return null;
    }
}
import { deleteChat, getExistingShapes } from "./utils/request";
import { render } from "./handlers/renderer";
import { EventHandlers } from "./handlers/eventHandlers";
import { MessageHandler } from "./handlers/messageHandler";
import { HistoryManager } from "./handlers/history";
import { findHitShape } from "./utils/hitTest";

export default class DrawRoom {
    private canvas: HTMLCanvasElement;
    private ws: WebSocket;
    private ctx: CanvasRenderingContext2D;
    private initX: number = 0;
    private initY: number = 0;
    private roomId: number;
    private userId: string | null = "";
    private tool: string = "";
    private locked: boolean = false;
    public pointerStatus: boolean = false;
    private rectangles: Rectangle[] = [];
    private lines: Line[] = [];
    private circles: Circle[] = [];
    private texts: Text[] = [];
    private color: string = '#ffffff';
    private pathData: Line[] = [];

    private scale: number = 1;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private onZoomChange?: (scale: number) => void;

    public typingState: { x: number; y: number; lines: string[]; cursorLine: number; cursorVisible: boolean; originalText?: Text } | null = null;
    public selectionRect: { x: number; y: number; width: number; height: number } | null = null;
    public selectedCodes: Set<string> = new Set();

    public eventHandler: EventHandlers;
    public messageHandler: MessageHandler;
    public history: HistoryManager;

    constructor(canvas: HTMLCanvasElement, roomId: number, ws: WebSocket, onZoomChange?: (scale: number) => void) {
        this.canvas = canvas;
        this.roomId = roomId;
        this.ws = ws;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.strokeStyle = "white";
        this.ctx.fillStyle = "white";
        this.userId = decodeUserId(localStorage.getItem('token') || "");
        this.onZoomChange = onZoomChange;

        this.eventHandler = new EventHandlers(this);
        this.messageHandler = new MessageHandler(this);
        this.history = new HistoryManager(this);

        getExistingShapes(this.roomId)
            .then((e: any) => {
                (e.messages).map((item: any) => {
                    const data = item.message;
                    if (data.shape == "rectangle") {
                        this.rectangles.push(data);
                    }
                    else if (data.shape == "circle") {
                        this.circles.push(data);
                    }
                    else if (data.shape == "line") {
                        this.lines.push(data);
                    }
                    else if (data.shape == "text") {
                        this.texts.push(data);
                    }
                    else if (data.shape == "eraser") {
                        this.eraseByCode(data.code);
                    }
                    else if (data.shape == "pencil") {
                        this.pathData.push(data);
                    }
                })
                render(this);
            })

    }

    getCanvas(): HTMLCanvasElement { return this.canvas; }
    getWs(): WebSocket { return this.ws; }
    getCtx(): CanvasRenderingContext2D { return this.ctx; }
    getInitX(): number { return this.initX; }
    setInitX(value: number): void { this.initX = value; }
    getInitY(): number { return this.initY; }
    setInitY(value: number): void { this.initY = value; }
    getRoomId(): number { return this.roomId; }
    getUserId(): string | null { return this.userId; }
    setUserId(value: string | null): void { this.userId = value; }
    getTool(): string { return this.tool; }
    setTool(value: string): void {
        this.tool = value;
        this.eventHandler?.refreshCursor();
    }
    isLocked(): boolean { return this.locked; }
    setLocked(value: boolean): void {
        this.locked = value;
        this.eventHandler?.refreshCursor();
    }
    getPointerStatus(): boolean { return this.pointerStatus; }
    setPointerStatus(value: boolean): void { this.pointerStatus = value; }
    getRectangles(): Rectangle[] { return this.rectangles; }
    setRectangles(value: Rectangle): void { this.rectangles.push(value); }
    getLines(): Line[] { return this.lines; }
    setLines(value: Line): void { this.lines.push(value); }
    getCircles(): Circle[] { return this.circles; }
    setCircles(value: Circle): void { this.circles.push(value); }
    getTexts(): Text[] { return this.texts; }
    setTexts(value: Text): void { this.texts.push(value); }
    removeText(code: string): void { this.texts = this.texts.filter(t => t.code !== code); }
    getColor(): string { return this.color; }
    setColor(value: string): void { this.color = value; }
    getPathData(): Line[] { return this.pathData; }
    setPathData(value: Line): void { this.pathData.push(value); }

    getScale(): number { return this.scale; }
    getOffsetX(): number { return this.offsetX; }
    getOffsetY(): number { return this.offsetY; }

    toWorldX(screenX: number): number { return (screenX - this.offsetX) / this.scale; }
    toWorldY(screenY: number): number { return (screenY - this.offsetY) / this.scale; }

    zoom(factor: number, centerX?: number, centerY?: number): void {
        const cx = centerX ?? this.canvas.width / 2;
        const cy = centerY ?? this.canvas.height / 2;
        const newScale = Math.min(Math.max(this.scale * factor, 0.1), 10);
        this.offsetX = cx - (cx - this.offsetX) * (newScale / this.scale);
        this.offsetY = cy - (cy - this.offsetY) * (newScale / this.scale);
        this.scale = newScale;
        render(this);
        this.onZoomChange?.(this.scale);
    }

    zoomIn(): void { this.zoom(1.2, this.canvas.width / 2, this.canvas.height / 2); }
    zoomOut(): void { this.zoom(1 / 1.2, this.canvas.width / 2, this.canvas.height / 2); }

    resetZoom(): void {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        render(this);
        this.onZoomChange?.(1);
    }

    pan(dx: number, dy: number): void {
        this.offsetX += dx;
        this.offsetY += dy;
        render(this);
    }


    clearSelection(): void {
        this.selectedCodes.clear();
        this.selectionRect = null;
    }

    undo(): void { this.history.undo(); }
    redo(): void { this.history.redo(); }

    /** Append a shape to its matching array based on its `shape` discriminator. */
    addShape(shape: Shape): void {
        switch (shape.shape) {
            case "rectangle": this.rectangles.push(shape as Rectangle); break;
            case "circle": this.circles.push(shape as Circle); break;
            case "line": this.lines.push(shape as Line); break;
            case "text": this.texts.push(shape as Text); break;
            case "pencil": this.pathData.push(shape as Line); break;
        }
    }

    /** All shapes (across every array) that share the given code. */
    getShapesByCode(code: string): Shape[] {
        return [
            ...this.rectangles, ...this.circles, ...this.lines, ...this.texts, ...this.pathData
        ].filter(s => s.code === code);
    }

    moveSelectedShapes(dx: number, dy: number): void {
        this.moveShapesByCodes(this.selectedCodes, dx, dy);
    }

    moveShapesByCodes(codes: Iterable<string>, dx: number, dy: number): void {
        const set = codes instanceof Set ? codes : new Set(codes);
        for (const rect of this.rectangles) {
            if (rect.code && set.has(rect.code)) { rect.x += dx; rect.y += dy; }
        }
        for (const circle of this.circles) {
            if (circle.code && set.has(circle.code)) { circle.x += dx; circle.y += dy; }
        }
        for (const line of this.lines) {
            if (line.code && set.has(line.code)) { line.x += dx; line.y += dy; line.toX += dx; line.toY += dy; }
        }
        for (const text of this.texts) {
            if (text.code && set.has(text.code)) { text.x += dx; text.y += dy; }
        }
        for (const pencil of this.pathData) {
            if (pencil.code && set.has(pencil.code)) { pencil.x += dx; pencil.y += dy; pencil.toX += dx; pencil.toY += dy; }
        }
        render(this);
    }

    eraseByCode(code: string) {
        this.rectangles = this.rectangles.filter(e => e.code !== code);
        this.circles = this.circles.filter(e => e.code !== code);
        this.lines = this.lines.filter(e => e.code !== code);
        this.texts = this.texts.filter(e => e.code !== code);
        this.pathData = this.pathData.filter(e => e.code !== code);
        render(this);
    }

    eraser(worldX: number, worldY: number) {
        const code = findHitShape(
            this.rectangles, this.circles, this.lines, this.texts, this.pathData,
            worldX, worldY
        );
        if (!code) return;
        const removed = this.getShapesByCode(code);
        deleteChat(code);
        this.eraseByCode(code);
        this.messageHandler.sendMessage({ shape: "eraser", code });
        this.history.record({ type: "erase", shapes: removed });
    }

    kill() {
        this.eventHandler.kill();
    }
}
