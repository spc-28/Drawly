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

    static renderTypingState(drawRoom: DrawRoom) {
        const ts = drawRoom.typingState;
        if (!ts) return;
        const ctx = drawRoom.getCtx();
        const FONT_SIZE = 40;
        const LINE_HEIGHT = 48;
        const ASCENT = 36;
        const DESCENT = 8;
        const PADDING = 10;
        ctx.font = `${FONT_SIZE}px Arial`;

        // Measure max line width for the border box
        const maxLineWidth = Math.max(40, ...ts.lines.map(l => ctx.measureText(l).width));
        const boxX = ts.x - PADDING;
        const boxY = ts.y - ASCENT - PADDING;
        const boxW = maxLineWidth + PADDING * 2 + 4;
        const boxH = (ts.lines.length - 1) * LINE_HEIGHT + ASCENT + DESCENT + PADDING * 2;

        // Dashed border box
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.setLineDash([]);
        ctx.restore();

        ctx.fillStyle = drawRoom.getColor();
        ts.lines.forEach((line, i) => {
            ctx.fillText(line, ts.x, ts.y + i * LINE_HEIGHT);
        });

        if (ts.cursorVisible) {
            const cursorLineText = ts.lines[ts.cursorLine] ?? "";
            const textWidth = ctx.measureText(cursorLineText).width;
            const cursorX = ts.x + textWidth + 2;
            const cursorBaselineY = ts.y + ts.cursorLine * LINE_HEIGHT;
            ctx.strokeStyle = drawRoom.getColor();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cursorX, cursorBaselineY - ASCENT);
            ctx.lineTo(cursorX, cursorBaselineY + DESCENT);
            ctx.stroke();
        }
    }
}

export function render(drawRoom: DrawRoom) {
    Renderer.clearCanvas(drawRoom.getCtx(), drawRoom.getCanvas(), drawRoom.getScale(), drawRoom.getOffsetX(), drawRoom.getOffsetY());
    Renderer.renderShapes(drawRoom);
    Renderer.renderTypingState(drawRoom);
}
