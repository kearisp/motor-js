import {Context} from "../core/Context";
import {Point2D} from "../types/Point2D";


class CanvasContext extends Context {
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;

    constructor() {
        super();

        this.canvas = document.createElement("canvas");

        // @ts-ignore
        this.context = this.canvas.getContext("2d");
    }

    public setStrokeStyle(color: string) {
        this.context.strokeStyle = color;
    }

    public setFillStyle(color: string) {
        this.context.fillStyle = color;
    }

    public drawLine(start: Point2D, end: Point2D) {
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
        this.context.closePath();
    }

    public fillRect(x: number, y: number, w: number, h: number) {
        this.context.fillRect(x, y, w, h);
    }

    public fillPolygon(points: Point2D[]): void {
        this.context.beginPath();

        const [start, ...rest] = points;

        this.context.moveTo(start.x, start.y);

        for(let i = 0; i < rest.length; i++) {
            this.context.lineTo(rest[i].x, rest[i].y);
        }

        this.context.closePath();
        this.context.stroke();
        this.context.fill();
    }

    public clear() {
        this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
    }

    public requestPointerLock(): Promise<any> {
        // @ts-ignore
        return this.canvas.requestPointerLock();
    }

    public render(root: HTMLElement) {
        const {
            width,
            height
        } = root.getBoundingClientRect();

        this.canvas.width = width;
        this.canvas.height = height;

        root.append(this.canvas);
    }
}


export {CanvasContext};
