import { drawCircle, drawLine, drawPencil, drawRectangle, writeText } from "../utils/drawing";
import { handlePositions, getShapeBounds } from "../utils/hitTest";
import { HandleId } from "../types/shape";
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

    static renderSelectionState(drawRoom: DrawRoom) {
        const ctx = drawRoom.getCtx();
        const codes = drawRoom.selectedCodes;

        if (codes.size > 0) {
            ctx.save();
            ctx.strokeStyle = '#4a90d9';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            for (const rect of drawRoom.getRectangles()) {
                if (!rect.code || !codes.has(rect.code)) continue;
                const x1 = Math.min(rect.x, rect.x + rect.width) - 5;
                const y1 = Math.min(rect.y, rect.y + rect.height) - 5;
                ctx.strokeRect(x1, y1, Math.abs(rect.width) + 10, Math.abs(rect.height) + 10);
            }
            for (const circle of drawRoom.getCircles()) {
                if (!circle.code || !codes.has(circle.code)) continue;
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, Math.abs(circle.radius) + 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (const line of drawRoom.getLines()) {
                if (!line.code || !codes.has(line.code)) continue;
                ctx.lineWidth = 14;
                ctx.globalAlpha = 0.25;
                ctx.beginPath();
                ctx.moveTo(line.x, line.y);
                ctx.lineTo(line.toX, line.toY);
                ctx.stroke();
                ctx.lineWidth = 2;
                ctx.globalAlpha = 1;
            }
            for (const text of drawRoom.getTexts()) {
                if (!text.code || !codes.has(text.code)) continue;
                const b = getShapeBounds(text);
                ctx.strokeRect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
            }
            // Pencil strokes: highlight each selected segment with a thick transparent stroke
            ctx.lineWidth = 14;
            ctx.globalAlpha = 0.25;
            for (const pencil of drawRoom.getPathData()) {
                if (!pencil.code || !codes.has(pencil.code)) continue;
                ctx.beginPath();
                ctx.moveTo(pencil.x, pencil.y);
                ctx.lineTo(pencil.toX, pencil.toY);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // Resize handles for a single selected shape (not while marquee-selecting).
        const bounds = drawRoom.getSelectedBounds();
        if (bounds && !drawRoom.selectionRect) {
            const scale = drawRoom.getScale();
            const hs = 8 / scale;
            ctx.save();
            ctx.strokeStyle = '#4a90d9';
            ctx.lineWidth = 1.5 / scale;
            ctx.setLineDash([]);
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.fillStyle = '#ffffff';
            const pos = handlePositions(bounds);
            for (const id of Object.keys(pos) as HandleId[]) {
                const [hx, hy] = pos[id];
                ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
                ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
            }
            ctx.restore();
        }

        const sel = drawRoom.selectionRect;
        if (sel) {
            ctx.save();
            ctx.strokeStyle = '#4a90d9';
            ctx.fillStyle = 'rgba(74, 144, 217, 0.08)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(sel.x, sel.y, sel.width, sel.height);
            ctx.fillRect(sel.x, sel.y, sel.width, sel.height);
            ctx.setLineDash([]);
            ctx.restore();
        }
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
    Renderer.renderSelectionState(drawRoom);
    Renderer.renderTypingState(drawRoom);
}
