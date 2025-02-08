export interface Shape {
    x:number;
    y:number;
    shape: string;
    color: string;
    code?: string;
}

export interface Rectangle extends Shape {
    width: number;
    height: number;
}

export interface Circle extends Shape {
    radius: number;
}

export interface Text extends Shape {
    text: string;
}

export interface Line extends Shape {
    toX: number;
    toY: number;
}

export interface Eraser {
    x:number;
    y:number;
    shape: string;
}