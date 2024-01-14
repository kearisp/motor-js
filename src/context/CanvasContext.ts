import {Point} from "../types/Point";
import {Point2D} from "../types/Point2D";
import {Context} from "../core/Context";
import {Polygon} from "../core/Polygon";
import {Model} from "../core/Model";
import {Camera} from "../core/Camera";
import {BSPNode} from "../core/BSPNode";


class CanvasContext extends Context {
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;

    constructor() {
        super();

        this.canvas = document.createElement("canvas");

        // @ts-ignore
        this.context = this.canvas.getContext("2d");
    }

    public get domElement() {
        return this.canvas;
    }

    public setWidth(width: number) {
        super.setWidth(width);

        this.canvas.width = width;
    }

    public setHeight(height: number) {
        super.setHeight(height);

        this.canvas.height = height;
    }

    public projectPoint(point: Point): Point2D {
        return {
            x: NaN,
            y: NaN
        };
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
        this.context.moveTo(this.getWidth() / 2 + start.x, this.getHeight() / 2 - start.y);
        this.context.lineTo(this.getWidth() / 2 + end.x, this.getHeight() / 2 - end.y);
        this.context.stroke();
        this.context.closePath();
    }

    public drawPolygon(polygon: Polygon) {
        // TODO
    }

    public fillRect(x: number, y: number, w: number, h: number) {
        this.context.fillRect(x, y, w, h);
    }

    public fillPolygon(points: Point2D[]): void {
        this.context.beginPath();

        const [start, ...rest] = points;

        if(!start) {
            return;
        }

        this.context.moveTo(
            (start.x + 1) * this.getWidth() / 2,
            (1 - start.y) * this.getHeight() / 2
        );

        for(let i = 0; i < rest.length; i++) {
            this.context.lineTo(
                (rest[i].x + 1) * this.getWidth() / 2,
                (1 - rest[i].y) * this.getHeight() / 2
            );
        }

        this.context.closePath();
        this.context.stroke();
        this.context.fill();
    }

    public clear(): void {
        this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
    }

    public render(models: Model[], camera: Camera): void {}

    public renderPolygons(polygons: Polygon[], camera: Camera): void {
        const bspNode = new BSPNode(polygons, camera, false);

        const front = new Polygon([
            {x: -100, y: -100, z: -1000},
            {x: 100, y: -100, z: -1000},
            {x: -100, y: -100, z: -1000},
            {x: 100, y: 100, z: -1000}
        ]);

        bspNode.traverse({x: 0, y: 0, z: 1}, (polygon: Polygon): void => {
            this.setStrokeStyle("#445555");
            this.setFillStyle(polygon.color || "#990000")

            const polygons = Polygon.intersect(polygon, front);

            polygons.forEach((polygon) => {
                this.fillPolygon(polygon.project(camera).points);
            })
        });
    }
}


export {CanvasContext};
