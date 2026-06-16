import DrawRoom from "../drawRoom";
import { Shape } from "../types/shape";
import { deleteChat } from "../utils/request";
import { render } from "./renderer";

export type HistoryEntry =
    | { type: "add"; shapes: Shape[] }
    | { type: "erase"; shapes: Shape[] }
    | { type: "move"; codes: string[]; dx: number; dy: number };

export class HistoryManager {
    private drawRoom: DrawRoom;
    private undoStack: HistoryEntry[] = [];
    private redoStack: HistoryEntry[] = [];
    private readonly limit = 100;

    constructor(drawRoom: DrawRoom) {
        this.drawRoom = drawRoom;
    }

    /** Record a new local action. Clears the redo stack (new branch of history). */
    record(entry: HistoryEntry): void {
        if (entry.type !== "move" && entry.shapes.length === 0) return;
        this.undoStack.push(entry);
        if (this.undoStack.length > this.limit) this.undoStack.shift();
        this.redoStack = [];
    }

    canUndo(): boolean { return this.undoStack.length > 0; }
    canRedo(): boolean { return this.redoStack.length > 0; }

    undo(): void {
        const entry = this.undoStack.pop();
        if (!entry) return;
        this.applyInverse(entry);
        this.redoStack.push(entry);
        render(this.drawRoom);
    }

    redo(): void {
        const entry = this.redoStack.pop();
        if (!entry) return;
        this.applyForward(entry);
        this.undoStack.push(entry);
        render(this.drawRoom);
    }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    /** Re-create shapes locally, broadcast them, and let the server persist them. */
    private addShapes(shapes: Shape[]): void {
        for (const shape of shapes) {
            this.drawRoom.addShape(shape);
            this.drawRoom.messageHandler.sendMessage(shape as never);
        }
    }

    /** Remove shapes locally + on peers + in the DB. Groups by code so a multi-segment
     *  pencil stroke is removed with a single eraser/delete per code. */
    private removeShapes(shapes: Shape[]): void {
        const codes = new Set(shapes.map(s => s.code).filter(Boolean) as string[]);
        for (const code of codes) {
            this.drawRoom.eraseByCode(code);
            deleteChat(code);
            this.drawRoom.messageHandler.sendMessage({ shape: "eraser", code });
        }
    }

    private applyForward(entry: HistoryEntry): void {
        if (entry.type === "add") this.addShapes(entry.shapes);
        else if (entry.type === "erase") this.removeShapes(entry.shapes);
        else this.drawRoom.moveShapesByCodes(entry.codes, entry.dx, entry.dy);
    }

    private applyInverse(entry: HistoryEntry): void {
        if (entry.type === "add") this.removeShapes(entry.shapes);
        else if (entry.type === "erase") this.addShapes(entry.shapes);
        else this.drawRoom.moveShapesByCodes(entry.codes, -entry.dx, -entry.dy);
    }
}
