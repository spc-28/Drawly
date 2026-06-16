import { v4 as uuidv4 } from "uuid";

// Unique opaque identity for a shape's `code`.
export function generateCode(): string {
    return uuidv4();
}
