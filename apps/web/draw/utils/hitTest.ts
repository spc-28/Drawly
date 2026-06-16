import { Rectangle, Circle, Line, Text, Shape, Pencil, Bounds, HandleId } from "../types/shape";

const TOLERANCE = 8;
const HANDLE_HIT = 8;

// Axis-aligned bounding box (top-left origin) of a single shape.
export function getShapeBounds(shape: Shape): Bounds {
    switch (shape.shape) {
        case "rectangle": {
            const r = shape as Rectangle;
            return { x: Math.min(r.x, r.x + r.width), y: Math.min(r.y, r.y + r.height), width: Math.abs(r.width), height: Math.abs(r.height) };
        }
        case "circle": {
            const c = shape as Circle;
            const rad = Math.abs(c.radius);
            return { x: c.x - rad, y: c.y - rad, width: rad * 2, height: rad * 2 };
        }
        case "line": {
            const l = shape as Line;
            return { x: Math.min(l.x, l.toX), y: Math.min(l.y, l.toY), width: Math.abs(l.toX - l.x), height: Math.abs(l.toY - l.y) };
        }
        case "text": {
            const t = shape as Text;
            const fontSize = t.fontSize ?? 40;
            const lines = t.text.split('\n');
            const maxLen = Math.max(1, ...lines.map(l => l.length));
            const width = maxLen * fontSize * 0.55;
            const height = (lines.length - 1) * fontSize * 1.2 + fontSize;
            return { x: t.x, y: t.y - fontSize, width, height };
        }
        case "pencil": {
            const pts = (shape as Pencil).points ?? [];
            if (pts.length === 0) return { x: shape.x, y: shape.y, width: 0, height: 0 };
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const [px, py] of pts) {
                minX = Math.min(minX, px!); minY = Math.min(minY, py!);
                maxX = Math.max(maxX, px!); maxY = Math.max(maxY, py!);
            }
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        }
        default:
            return { x: shape.x, y: shape.y, width: 0, height: 0 };
    }
}

// Screen position of each resize handle for a bounding box.
export function handlePositions(b: Bounds): Record<HandleId, [number, number]> {
    const { x, y, width: w, height: h } = b;
    return {
        nw: [x, y], n: [x + w / 2, y], ne: [x + w, y],
        e: [x + w, y + h / 2], se: [x + w, y + h], s: [x + w / 2, y + h],
        sw: [x, y + h], w: [x, y + h / 2],
    };
}

// Which resize handle (if any) the point is over. Corners take priority over edges.
export function hitResizeHandle(b: Bounds, x: number, y: number, scale: number): HandleId | null {
    const tol = HANDLE_HIT / scale;
    const pos = handlePositions(b);
    const order: HandleId[] = ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w'];
    for (const id of order) {
        const [hx, hy] = pos[id];
        if (Math.abs(x - hx) <= tol && Math.abs(y - hy) <= tol) return id;
    }
    return null;
}

// New normalized bounds when dragging `handle` to (px, py); the opposite edge stays fixed.
export function resizeBounds(handle: HandleId, ob: Bounds, px: number, py: number): Bounds {
    let left = ob.x, right = ob.x + ob.width, top = ob.y, bottom = ob.y + ob.height;
    if (handle.includes('w')) left = px;
    if (handle.includes('e')) right = px;
    if (handle.includes('n')) top = py;
    if (handle.includes('s')) bottom = py;
    return {
        x: Math.min(left, right), y: Math.min(top, bottom),
        width: Math.abs(right - left), height: Math.abs(bottom - top),
    };
}

function overlaps(
    rx1: number, ry1: number, rx2: number, ry2: number,
    bx1: number, by1: number, bx2: number, by2: number
): boolean {
    const minBx = Math.min(bx1, bx2), maxBx = Math.max(bx1, bx2) || minBx + 1;
    const minBy = Math.min(by1, by2), maxBy = Math.max(by1, by2) || minBy + 1;
    return rx1 <= maxBx && rx2 >= minBx && ry1 <= maxBy && ry2 >= minBy;
}

export function findShapesInRect(
    rectangles: Rectangle[], circles: Circle[], lines: Line[], texts: Text[], pathData: Line[],
    selX: number, selY: number, selW: number, selH: number
): Set<string> {
    const rx1 = Math.min(selX, selX + selW);
    const rx2 = Math.max(selX, selX + selW);
    const ry1 = Math.min(selY, selY + selH);
    const ry2 = Math.max(selY, selY + selH);
    const codes = new Set<string>();

    for (const r of rectangles) {
        if (!r.code) continue;
        const bx1 = r.x, bx2 = r.x + r.width;
        const by1 = r.y, by2 = r.y + r.height;
        if (overlaps(rx1, ry1, rx2, ry2, bx1, by1, bx2, by2)) codes.add(r.code);
    }
    for (const c of circles) {
        if (!c.code) continue;
        const rad = Math.abs(c.radius);
        if (overlaps(rx1, ry1, rx2, ry2, c.x - rad, c.y - rad, c.x + rad, c.y + rad)) codes.add(c.code);
    }
    for (const l of lines) {
        if (!l.code) continue;
        if (overlaps(rx1, ry1, rx2, ry2, l.x, l.y, l.toX, l.toY)) codes.add(l.code);
    }
    for (const p of pathData) {
        if (!p.code) continue;
        if (overlaps(rx1, ry1, rx2, ry2, p.x, p.y, p.toX, p.toY)) codes.add(p.code);
    }
    for (const t of texts) {
        if (!t.code) continue;
        const b = getShapeBounds(t);
        if (overlaps(rx1, ry1, rx2, ry2, b.x, b.y, b.x + b.width, b.y + b.height)) codes.add(t.code);
    }
    return codes;
}

function pointToSegmentDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function hitRectangle(rect: Rectangle, x: number, y: number): boolean {
    const x1 = Math.min(rect.x, rect.x + rect.width);
    const x2 = Math.max(rect.x, rect.x + rect.width);
    const y1 = Math.min(rect.y, rect.y + rect.height);
    const y2 = Math.max(rect.y, rect.y + rect.height);
    return (
        pointToSegmentDist(x, y, x1, y1, x2, y1) < TOLERANCE ||
        pointToSegmentDist(x, y, x2, y1, x2, y2) < TOLERANCE ||
        pointToSegmentDist(x, y, x2, y2, x1, y2) < TOLERANCE ||
        pointToSegmentDist(x, y, x1, y2, x1, y1) < TOLERANCE
    );
}

function hitCircle(circle: Circle, x: number, y: number): boolean {
    const dist = Math.hypot(x - circle.x, y - circle.y);
    return Math.abs(dist - Math.abs(circle.radius)) < TOLERANCE;
}

function hitLine(line: Line, x: number, y: number): boolean {
    return pointToSegmentDist(x, y, line.x, line.y, line.toX, line.toY) < TOLERANCE;
}

function hitText(text: Text, x: number, y: number): boolean {
    const b = getShapeBounds(text);
    return (
        x >= b.x - TOLERANCE && x <= b.x + b.width + TOLERANCE &&
        y >= b.y - TOLERANCE && y <= b.y + b.height + TOLERANCE
    );
}

export function findHitTextShape(texts: Text[], x: number, y: number): Text | undefined {
    for (let i = texts.length - 1; i >= 0; i--) {
        const s = texts[i]!;
        if (hitText(s, x, y)) return s;
    }
    return undefined;
}

export function findHitShape(
    rectangles: Rectangle[],
    circles: Circle[],
    lines: Line[],
    texts: Text[],
    pathData: Line[],
    x: number,
    y: number
): string | undefined {
    for (let i = rectangles.length - 1; i >= 0; i--) {
        const s = rectangles[i]!;
        if (hitRectangle(s, x, y)) return s.code;
    }
    for (let i = circles.length - 1; i >= 0; i--) {
        const s = circles[i]!;
        if (hitCircle(s, x, y)) return s.code;
    }
    for (let i = lines.length - 1; i >= 0; i--) {
        const s = lines[i]!;
        if (hitLine(s, x, y)) return s.code;
    }
    for (let i = texts.length - 1; i >= 0; i--) {
        const s = texts[i]!;
        if (hitText(s, x, y)) return s.code;
    }
    for (let i = pathData.length - 1; i >= 0; i--) {
        const s = pathData[i]!;
        if (hitLine(s, x, y)) return s.code;
    }
    return undefined;
}
