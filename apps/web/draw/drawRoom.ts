import { Rectangle, Circle, Line, Text } from "./types/shape";
import { checkUser } from "@repo/common/types";
import { deleteChat, getExistingShapes } from "./utils/request";
import { render } from "./handlers/renderer";
import { rgbaToHex } from "./utils/virtual";
import { drawCircle, drawLine, drawPencil, drawRectangle, writeText } from "./utils/drawing";
import { EventHandlers } from "./handlers/eventHandlers";
import { MessageHandler } from "./handlers/messageHandler";

export default class DrawRoom {
    private canvas: HTMLCanvasElement;
    private canvasV: HTMLCanvasElement;
    private ws: WebSocket;
    private ctx: CanvasRenderingContext2D;
    private ctxV: CanvasRenderingContext2D;
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

    public eventHandler: EventHandlers;
    public messageHandler: MessageHandler;

    constructor(canvas: HTMLCanvasElement, roomId: number, ws: WebSocket, canvasV: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvasV = canvasV;
        this.roomId = roomId;
        this.ws = ws;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctxV = canvasV.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.strokeStyle = "white";
        this.ctx.fillStyle = "white";
        this.userId = checkUser(localStorage.getItem('token') || "");

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
                        this.eraser(data.x, data.y);
                    }
                    else {
                        data.map((e: Line) => this.pathData.push(e))
                    }
                })
                this.clearCanvasV();
                render(this);
            })

    }

    getCanvas(): HTMLCanvasElement { return this.canvas; }
    getCanvasV(): HTMLCanvasElement { return this.canvasV; }
    getWs(): WebSocket { return this.ws; }
    getCtx(): CanvasRenderingContext2D { return this.ctx; }
    getCtxV(): CanvasRenderingContext2D { return this.ctxV; }
    getInitX(): number { return this.initX; }
    setInitX(value: number): void { this.initX = value; }
    getInitY(): number { return this.initY; }
    setInitY(value: number): void { this.initY = value; }
    getRoomId(): number { return this.roomId; }
    getUserId(): string | null { return this.userId; }
    setUserId(value: string | null): void { this.userId = value; }
    getTool(): string { return this.tool; }
    setTool(value: string): void { this.tool = value; }
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


    clearCanvasV() {
        this.ctxV.clearRect(0, 0, this.canvasV.width, this.canvasV.height);
        this.ctxV.fillStyle = "#121212";
        this.ctxV.fillRect(0, 0, this.canvasV.width, this.canvasV.height);
        if (this.rectangles.length > 0) {
            this.rectangles.map((e: Rectangle) => drawRectangle(this.ctxV, e, e.code));
        }
        if (this.circles.length > 0) {
            this.circles.map((e: Circle) => drawCircle(this.ctxV, e, e.code));
        }
        if (this.lines.length > 0) {
            this.lines.map((e: Line) => drawLine(this.ctxV, e, e.code));
        }
        if (this.texts.length > 0) {
            this.texts.map((e: Text) => writeText(this.ctxV, e, e.code));
        }
        if (this.pathData.length > 0) {
            this.pathData.map((e: Line) => drawPencil(this.ctxV, e, e.code))
        }
    }


    eraser(x: number, y: number) {
        this.clearCanvasV();
        const data = this.ctxV.getImageData(x, y, 1, 1).data;

        const c = rgbaToHex(data[0], data[1], data[2], data[3]).slice(0, 7);

        if (c != "#121212") {
            let toDelete: string | undefined = '';

            if (this.rectangles.length > 0) {
                this.rectangles = this.rectangles.filter((e) => {
                    if (e.code != c) {
                        return e;
                    }
                    else {
                        toDelete = e.code;
                    }

                })
            }
            if (this.circles.length > 0) {
                this.circles = this.circles.filter((e) => {
                    if (e.code != c) {
                        return e;
                    }
                    else {
                        toDelete = e.code;
                    }

                })
            }
            if (this.lines.length > 0) {
                this.lines = this.lines.filter((e) => {
                    if (e.code != c) {
                        return e;
                    }
                    else {
                        toDelete = e.code;
                    }

                })
            }
            if (this.texts.length > 0) {
                this.texts = this.texts.filter((e) => {
                    if (e.code != c) {
                        return e;
                    }
                    else {
                        toDelete = e.code;
                    }

                })
            }
            if (this.pathData.length > 0) {
                this.pathData = this.pathData.filter((e) => {
                    if (e.code != c) {
                        return e;
                    }
                    else {
                        toDelete = e.code;
                    }

                })
            }
            deleteChat(toDelete);
            render(this);
            this.clearCanvasV();
            this.messageHandler.sendMessage({
                x: x,
                y: y,
                shape: "eraser"
            })
        }
    }

    kill() {
        this.eventHandler.kill();
    }
}
