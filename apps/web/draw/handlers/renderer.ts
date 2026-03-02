import { drawCircle, drawLine, drawPencil, drawRectangle, writeText } from "../utils/drawing";
import DrawRoom from "../drawRoom";


class Renderer {
    static clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scale: number, offsetX: number, offsetY: number) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    }

    static renderShapes(drawRoom: DrawRoom) {
        drawRoom.getRectangles().forEach(rect => drawRectangle(drawRoom.getCtx(), rect));
        drawRoom.getCircles().forEach(circle => drawCircle(drawRoom.getCtx(), circle));
        drawRoom.getLines().forEach(line => drawLine(drawRoom.getCtx(), line));
        drawRoom.getTexts().forEach(text => writeText(drawRoom.getCtx(), text));
        drawRoom.getPathData().forEach(pencil => drawPencil(drawRoom.getCtx(), pencil));
    }
}

export function render(drawRoom: DrawRoom) {
    Renderer.clearCanvas(drawRoom.getCtx(), drawRoom.getCanvas(), drawRoom.getScale(), drawRoom.getOffsetX(), drawRoom.getOffsetY());
    Renderer.renderShapes(drawRoom);
}
