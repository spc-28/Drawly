import { Rectangle, Circle, Line, Text } from "./types/shape";
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

    public eventHandler: EventHandlers;
    public messageHandler: MessageHandler;

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
        deleteChat(code);
        this.eraseByCode(code);
        this.messageHandler.sendMessage({ shape: "eraser", code });
    }

    kill() {
        this.eventHandler.kill();
    }
}
