import {Point2D} from "../types/Point2D";
import {Vector2D} from "./Vector2D";


export class Polygon2D {
    protected center?: Point2D;

    public constructor(
        public points: Point2D[]
    ) {}

    public getCenter(): Point2D {
        if(!this.center) {
            this.calcCenter();
        }

        return this.center as Point2D;
    }

    protected calcCenter(): void {
        let center: Point2D = {
            x: 0,
            y: 0
        };

        for(let i = 0; i < this.points.length; i++) {
            center.x += this.points[i].x;
            center.y += this.points[i].y;
        }

        this.center = {
            x: center.x / this.points.length,
            y: center.y / this.points.length
        };
    }
}
