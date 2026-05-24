import { Rectangle, Circle, Line, Text } from "../types/shape";

const TOLERANCE = 8;

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
        const tLines = t.text.split('\n');
        const maxLen = Math.max(...tLines.map(l => l.length));
        const tw = maxLen * 22;
        const th = (tLines.length - 1) * 48 + 40;
        if (overlaps(rx1, ry1, rx2, ry2, t.x, t.y - 40, t.x + tw, t.y - 40 + th)) codes.add(t.code);
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
    const lines = text.text.split('\n');
    const maxLen = Math.max(...lines.map(l => l.length));
    const approxWidth = maxLen * 22;
    return (
        x >= text.x - TOLERANCE &&
        x <= text.x + approxWidth + TOLERANCE &&
        y >= text.y - 40 - TOLERANCE &&
        y <= text.y + (lines.length - 1) * 48 + TOLERANCE
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
