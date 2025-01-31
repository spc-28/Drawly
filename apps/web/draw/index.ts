import { Circle, Line, Rectangle, Text } from "../types/shape";
import { drawCircle, drawLine, drawPencil, drawRectangle, writeText } from "./utils/drawing";
import { checkUser } from '@repo/common/check';
import { getRandomHexColor, rgbaToHex } from "./utils/virtual";
import { deleteChat, getExistingShapes } from "./utils/request";

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
    private pointerStatus: boolean = false;
    private rectangles: Rectangle[] = [];
    private lines: Line[] = [];
    private circles: Circle[] = [];
    private texts: Text[] = [];
    private color: string = '#ffffff';
    //@ts-ignore
    public pathData: Line[] = [];

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

        if (this.userId != "" || !this.userId) {

            canvas.addEventListener('mousedown', this.mouseDown);
            canvas.addEventListener('mousemove', this.mouseMove);
            canvas.addEventListener('mouseup', this.mouseUp);

            ws.onmessage = (e: any) => {
                const data = JSON.parse(e.data);

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
                this.clearCanvasV();
                this.clearCanvas();
            }

            getExistingShapes(roomId)
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
                    this.clearCanvas();
                })

        }

    }

    mouseDown = (e: any) => {
        this.pointerStatus = true;
        this.initX = e.clientX
        this.initY = e.clientY

        if (this.tool == "Pencil" || this.tool == "Line") {
            this.ctx.fillStyle = this.color || "#ffffff";
        }
    }

    mouseMove = (e: any) => {
        if (this.pointerStatus) {

            if (this.tool == "Pencil") {
                const pencil = {
                    x: this.initX,
                    y: this.initY,
                    toX: e.clientX,
                    toY: e.clientY,
                    shape: "pencil",
                    color: this.color,
                    code: getRandomHexColor()
                }
                const arr = drawPencil(this.ctx, pencil);
                this.initX = arr[0];
                this.initY = arr[1];
                this.pathData.push(pencil);
            }

            else if (this.tool == "Rectangle") {
                this.clearCanvas();
                const rect = {
                    x: this.initX,
                    y: this.initY,
                    width: e.clientX - this.initX,
                    height: e.clientY - this.initY,
                    shape: "rectangle",
                    color: this.color
                }
                drawRectangle(this.ctx, rect);
            }
            else if (this.tool == "Circle") {
                this.clearCanvas();
                const circle = {
                    x: this.initX,
                    y: this.initY,
                    radius: e.clientX - this.initX,
                    shape: "circle",
                    color: this.color
                }
                drawCircle(this.ctx, circle);
            }

            else if (this.tool == "Line") {
                this.clearCanvas();
                const line = {
                    x: this.initX,
                    y: this.initY,
                    toX: e.clientX,
                    toY: e.clientY,
                    shape: "line",
                    color: this.color
                }
                drawLine(this.ctx, line);
            }

        }
    }

    mouseUp = (e: any) => {
        this.pointerStatus = false;

        if (this.tool == "Rectangle") {
            const rect = {
                x: this.initX,
                y: this.initY,
                width: e.clientX - this.initX,
                height: e.clientY - this.initY,
                shape: "rectangle",
                color: this.color,
                code: getRandomHexColor()
            }
            this.rectangles.push(rect);
            this.sendMessage(rect);
        }

        else if (this.tool == "Eraser") {
            // eraser(this.ctx,rect);
            // this.sendMessage(rect);
            const x = e.clientX;
            const y = e.clientY;
            this.eraser(x, y);
        }

        else if (this.tool == "Text") {
            const text = {
                x: this.initX,
                y: this.initY,
                shape: "text",
                text: String(prompt("Enter the Text")),
                color: this.color,
                code: getRandomHexColor()
            }
            this.texts.push(text);
            writeText(this.ctx, text);
            this.sendMessage(text);
        }
        else if (this.tool == "Circle") {
            const circle = {
                x: this.initX,
                y: this.initY,
                radius: e.clientX - this.initX,
                shape: "circle",
                color: this.color,
                code: getRandomHexColor()
            }
            this.circles.push(circle);
            this.sendMessage(circle);
        }
        else if (this.tool == "Line") {
            const line = {
                x: this.initX,
                y: this.initY,
                toX: e.clientX,
                toY: e.clientY,
                shape: "line",
                color: this.color,
                code: getRandomHexColor()
            }
            this.lines.push(line);
            this.sendMessage(line);
        }
        else if (this.tool == "Pencil") {
            const pencil = {
                x: this.initX,
                y: this.initY,
                toX: e.clientX,
                toY: e.clientY,
                shape: "pencil",
                color: this.color,
                code: getRandomHexColor()
            }
            this.pathData.push(pencil);
            this.sendMessage(this.pathData);
        }

    }

    setTool(tool: string) {
        this.tool = tool;
    }

    setColor(color: string) {
        this.ctx.strokeStyle = this.ctx.fillStyle = this.color = color;
    }

    sendMessage(message: Rectangle | Circle | Text | Line | Line[] | { x: number; y: number; shape: string }) {
        this.ws.send(JSON.stringify(
            {
                message,
                type: "chat",
                roomId: this.roomId,
                userId: this.userId
            }
        ));

    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#121212";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.rectangles.length > 0) {
            this.rectangles.map((e: any) => drawRectangle(this.ctx, e));
        }
        if (this.circles.length > 0) {
            this.circles.map((e: any) => drawCircle(this.ctx, e));
        }
        if (this.lines.length > 0) {
            this.lines.map((e: any) => drawLine(this.ctx, e));
        }
        if (this.texts.length > 0) {
            this.texts.map((e: any) => writeText(this.ctx, e));
        }
        if (this.pathData.length > 0) {
            this.pathData.map((e: any) => drawPencil(this.ctx, e))
        }
    }

    clearCanvasV() {
        this.ctxV.clearRect(0, 0, this.canvasV.width, this.canvasV.height);
        this.ctxV.fillStyle = "#121212";
        this.ctxV.fillRect(0, 0, this.canvasV.width, this.canvasV.height);
        if (this.rectangles.length > 0) {
            this.rectangles.map((e: any) => drawRectangle(this.ctxV, e, e.code));
        }
        if (this.circles.length > 0) {
            this.circles.map((e: any) => drawCircle(this.ctxV, e, e.code));
        }
        if (this.lines.length > 0) {
            this.lines.map((e: any) => drawLine(this.ctxV, e, e.code));
        }
        if (this.texts.length > 0) {
            this.texts.map((e: any) => writeText(this.ctxV, e, e.code));
        }
        if (this.pathData.length > 0) {
            this.pathData.map((e: any) => drawPencil(this.ctxV, e, e.code))
        }
    }

    eraser(x: number, y: number) {
        this.clearCanvasV();
        const data = this.ctxV.getImageData(x, y, 1, 1).data

        const c = rgbaToHex(data[0], data[1], data[2], data[3]).slice(0, 7);

        if (c != "#121212") {
            let toDelete: string='';

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
            this.clearCanvas();
            this.clearCanvasV();
            this.sendMessage({
                x: x,
                y: y,
                shape: "eraser"
            })
        }
    }

    kill() {
        this.canvas.removeEventListener("mousedown", this.mouseDown);
        this.canvas.removeEventListener("mouseup", this.mouseUp);
        this.canvas.removeEventListener("mousemove", this.mouseMove);
    }

}