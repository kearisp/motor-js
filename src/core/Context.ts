import {Point2D} from "../types/Point2D";


abstract class Context {
    protected width: number = 0;
    protected height: number = 0;

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public setWidth(width: number): void {
        this.width = width;
    }

    public setHeight(height: number): void {
        this.height = height;
    }

    public abstract setFillStyle(color: string): void;
    public abstract setStrokeStyle(color: string): void;
    public abstract drawLine(start: Point2D, end: Point2D): void;
    public abstract fillRect(x: number, y: number, w: number, h: number): void;
    public abstract fillPolygon(points: Point2D[]): void;
    public abstract render(root: HTMLElement): void;
    public abstract clear(): void;
    public abstract requestPointerLock(): void;
}


export {Context};
