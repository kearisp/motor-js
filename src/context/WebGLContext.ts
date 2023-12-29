import {Context} from "../core/Context";
import {Point2D} from "../types/Point2D";


export class WebGLContext extends Context {
    public constructor() {
        super();
    }

    public clear(): void {}

    public drawLine(start: Point2D, end: Point2D): void {}

    public fillPolygon(points: Point2D[]): void {}

    public fillRect(x: number, y: number, w: number, h: number): void {}

    public render(root: HTMLElement): void {}

    public requestPointerLock(): void {}

    public setFillStyle(color: string): void {}

    public setStrokeStyle(color: string): void {}
}
