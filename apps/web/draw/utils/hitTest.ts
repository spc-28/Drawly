import { Rectangle, Circle, Line, Text } from "../types/shape";

const TOLERANCE = 8;

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
