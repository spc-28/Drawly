import { Rectangle, Circle, Line, Text, Shape, Pencil, Bounds } from "./types/shape";
function decodeUserId(token: string): string | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
        return payload.userId ?? null;
    } catch {
        return null;
    }
}
import { getExistingShapes } from "./utils/request";
import { render } from "./handlers/renderer";
import { EventHandlers } from "./handlers/eventHandlers";
import { MessageHandler } from "./handlers/messageHandler";
import { HistoryManager } from "./handlers/history";
import { findHitShape, getShapeBounds } from "./utils/hitTest";

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
            .then((e) => {
                for (const stored of e.shapes) {
                    this.addShape(stored.data);
                }
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

    // Pencil arrives aggregated and is expanded into Line segments in memory.
    addShape(shape: Shape): void {
        switch (shape.shape) {
            case "rectangle": this.rectangles.push(shape as Rectangle); break;
            case "circle": this.circles.push(shape as Circle); break;
            case "line": this.lines.push(shape as Line); break;
            case "text": this.texts.push(shape as Text); break;
            case "pencil": this.pathData.push(...expandPencil(shape as Pencil)); break;
        }
    }

    // Bounds of the single selected shape (null unless exactly one is selected).
    getSelectedBounds(): Bounds | null {
        if (this.selectedCodes.size !== 1) return null;
        const code = [...this.selectedCodes][0]!;
        const shape = this.getShapesByCode(code)[0];
        return shape ? getShapeBounds(shape) : null;
    }

    // Replace the shape(s) with this code in place (used by remote updates + undo/redo).
    upsertShapeLocal(data: Shape): void {
        if (data.code) this.eraseByCode(data.code);
        this.addShape(data);
    }

    // Map the selected shape's geometry from one bounds box to another.
    resizeSelected(from: Bounds, to: Bounds): void {
        const codes = this.selectedCodes;
        const tx = (px: number) => from.width === 0 ? to.x : to.x + (px - from.x) / from.width * to.width;
        const ty = (py: number) => from.height === 0 ? to.y : to.y + (py - from.y) / from.height * to.height;

        for (const r of this.rectangles) {
            if (!r.code || !codes.has(r.code)) continue;
            const x1 = tx(r.x), y1 = ty(r.y), x2 = tx(r.x + r.width), y2 = ty(r.y + r.height);
            r.x = x1; r.y = y1; r.width = x2 - x1; r.height = y2 - y1;
        }
        for (const l of this.lines) {
            if (!l.code || !codes.has(l.code)) continue;
            const x1 = tx(l.x), y1 = ty(l.y);
            l.toX = tx(l.toX); l.toY = ty(l.toY); l.x = x1; l.y = y1;
        }
        for (const c of this.circles) {
            if (!c.code || !codes.has(c.code)) continue;
            c.x = to.x + to.width / 2; c.y = to.y + to.height / 2;
            c.radius = Math.max(Math.abs(to.width), Math.abs(to.height)) / 2;
        }
        for (const t of this.texts) {
            if (!t.code || !codes.has(t.code)) continue;
            const ratio = from.height === 0 ? 1 : to.height / from.height;
            const newFont = Math.max(4, (t.fontSize ?? 40) * ratio);
            t.fontSize = newFont; t.x = to.x; t.y = to.y + newFont;
        }
        for (const p of this.pathData) {
            if (!p.code || !codes.has(p.code)) continue;
            const x1 = tx(p.x), y1 = ty(p.y);
            p.toX = tx(p.toX); p.toY = ty(p.toY); p.x = x1; p.y = y1;
        }
        render(this);
    }

    // Pencil segments are collapsed back into one aggregated Pencil.
    getShapesByCode(code: string): Shape[] {
        const single = [...this.rectangles, ...this.circles, ...this.lines, ...this.texts]
            .find(s => s.code === code);
        if (single) return [single];
        const segs = this.pathData.filter(s => s.code === code);
        if (segs.length) return [aggregatePencil(segs)];
        return [];
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
        this.eraseByCode(code);
        this.messageHandler.sendMessage({ shape: "eraser", code });
        this.history.record({ type: "erase", shapes: removed });
    }

    kill() {
        this.eventHandler.kill();
    }
}

export function expandPencil(pencil: Pencil): Line[] {
    const pts = pencil.points ?? [];
    const segs: Line[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
        segs.push({
            x: pts[i]![0]!, y: pts[i]![1]!,
            toX: pts[i + 1]![0]!, toY: pts[i + 1]![1]!,
            shape: "pencil", color: pencil.color, code: pencil.code,
        });
    }
    return segs;
}

export function aggregatePencil(segments: Line[]): Pencil {
    const first = segments[0];
    const points: number[][] = [];
    if (first) {
        points.push([first.x, first.y]);
        for (const s of segments) points.push([s.toX, s.toY]);
    }
    return {
        x: first?.x ?? 0, y: first?.y ?? 0,
        shape: "pencil", color: first?.color ?? "#ffffff",
        code: first?.code ?? "", points,
    };
}
