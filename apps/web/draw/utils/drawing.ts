import { Circle, Line, Rectangle, Text } from "../types/shape";

export function drawRectangle(ctx: CanvasRenderingContext2D, rect: Rectangle, color?: string) {
    if(color && color[0] == '#'){
        ctx.strokeStyle = ctx.fillStyle = color
        ctx.lineWidth = 5;
    }
    else{
        ctx.strokeStyle = ctx.fillStyle = rect.color;
        ctx.lineWidth = 5;
    }
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.stroke();
}

export function drawCircle(ctx: CanvasRenderingContext2D, circle: Circle, color?: string) {
    if(color && color[0] == '#'){
        ctx.strokeStyle = ctx.fillStyle = color
        ctx.lineWidth = 5;
    }
    else{
        ctx.strokeStyle = ctx.fillStyle = circle.color;
        ctx.lineWidth = 5;
    }
    ctx.beginPath();
    ctx.arc(circle.x,circle.y,Math.abs(circle.radius),0,2*Math.PI);
    ctx.stroke();
}

export function drawLine(ctx: CanvasRenderingContext2D, line: Line, color?: string) {
    if(color && color[0] == '#'){
        ctx.strokeStyle = ctx.fillStyle = color
        ctx.lineWidth = 5;
    }
    else{
        ctx.strokeStyle = ctx.fillStyle = line.color;
        ctx.lineWidth = 5;
    }
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(line.toX, line.toY);
    ctx.stroke();
}

export function writeText(ctx: CanvasRenderingContext2D, text:Text, color?: string) {
    if(color && color[0] == '#'){
        ctx.strokeStyle = ctx.fillStyle = color
    }
    else{
        ctx.strokeStyle = ctx.fillStyle = text.color;
    }
    ctx.font = "40px Arial";
    if(text.text == "null"){
        return;
    }
    ctx.fillText(text.text, text.x, text.y);
}

export function drawPencil(ctx: CanvasRenderingContext2D, pencil:Line, color?: string):[number,number] {
    drawLine(ctx, pencil, color);
    return [pencil.toX, pencil.toY];
}