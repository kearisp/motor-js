import {Point2D} from "../types/Point2D";


export class Vector2D {
    constructor(
        public x: number,
        public y: number
    ) {}

    public toPoint(): Point2D {
        return {
            x: this.x,
            y: this.y
        };
    }

    public static distance(a: Point2D) {
        return Math.sqrt(a.x ** 2 + a.y ** 2);
    }

    public static distanceBetween(a: Point2D, b: Point2D) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }

    public static summary(a: Point2D, b: Point2D): Point2D {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
    }

    public static subtract(a: Point2D, b: Point2D): Point2D {
        return {
            x: b.x - a.x,
            y: b.y - a.y
        };
    }

    public static multiply(a: Point2D, n: number) {
        return {
            x: a.x * n,
            y: a.y * n
        };
    }

    public static fromPoint(point: Point2D) {
        return new Vector2D(point.x, point.y);
    }
}