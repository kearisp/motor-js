import {Point} from "../types/Point";
import {Polygon} from "./Polygon";


export class Vector {
    public constructor(
        public x: number,
        public y: number,
        public z: number
    ) {}

    get distance(): number {
        return Vector.distance(this);
    }

    public set(point: Point): this {
        this.x = point.x;
        this.y = point.y;
        this.z = point.z;

        return this;
    }

    public add(point: Point): this {
        this.set(Vector.summary(this, point));

        return this;
    }

    public multiply(by: number): this {
        this.set(Vector.multiply(this, by));

        return this;
    }

    public sub(point: Point): this {
        this.set(Vector.subtract(this, point));

        return this;
    }

    public normalize(): this {
        const {x, y, z} = Vector.normalize(this);

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }

    public toPoint(): Point {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        };
    }

    public static fromPoint(point: Point): Vector {
        return new Vector(point.x, point.y, point.z);
    }

    public static summary(a: Point, b: Point): Point {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        };
    }

    public static subtract(a: Point, b: Point): Point {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z
        };
    }

    public static cross(a: Point, b: Point): Point {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    public static distance(a: Point): number {
        return Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);
    }

    public static normalize(a: Point): Point {
        const length = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);

        return {
            x: a.x / length,
            y: a.y / length,
            z: a.z / length
        };
    }

    public static magnitude(a: Point): number {
        return Math.sqrt(Vector.dot(a, a));
    }

    public static angle(v1: Point, v2: Point) {
        const mag1 = Vector.magnitude(v1),
            mag2 = Vector.magnitude(v2),
            dot = Vector.dot(v1, v2);

        return Math.acos(dot / (mag1 * mag2));
    }

    public static multiply(a: Point, by: number): Point {
        return {
            x: a.x * by,
            y: a.y * by,
            z: a.z * by
        };
    }

    public static dot(a: Point, b: Point): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    public static intersectPlaneV1(rayOrigin: Point, rayVector: Point, v0: Point, v1: Point, v2: Point): Point | null {
        const EPSILON = 0.0000001;
        const edge1 = Vector.subtract(v1, v0);
        const edge2 = Vector.subtract(v2, v0);
        const planeNormal = Vector.cross(edge1, edge2);

        const denominator = Vector.dot(planeNormal, rayVector);

        if(Math.abs(denominator) < EPSILON) {
            return null;
        }

        const t = Vector.dot(planeNormal, Vector.subtract(v0, rayOrigin)) / denominator;

        if(t < 0) {
            return null;
        }

        return Vector.summary(rayOrigin, Vector.multiply(rayVector, t));
    }

    public static intersectPlaneV2(point: Point, direction: Point, v0: Point, v1: Point, v2: Point): Point | null {
        let edge1: Point = Vector.subtract(v1, v0);
        let edge2: Point = Vector.subtract(v2, v0);
        let normal: Point = Vector.cross(edge1, edge2);

        // Розрахунок відстані до площини
        let d: number = -Vector.dot(normal, v0);
        let denom: number = Vector.dot(normal, direction);

        // Перевірка, чи вектор паралельний площині
        if(Math.abs(denom) < 1e-6) {
            return null;
        }

        let t: number = -(Vector.dot(normal, point) + d) / denom;

        return Vector.summary(point, Vector.multiply(direction, t));
    }

    public static intersectPolygon(point: Point, direction: Point, polygon: Polygon): Point|null {
        const d = -(Vector.dot(polygon.getNormal(), polygon.points[0]));
        const t = -(Vector.dot(polygon.getNormal(), point) + d) / Vector.dot(polygon.getNormal(), direction);

        if(isNaN(t) || !isFinite(t)) {
            return null;
        }

        const intersectPoint = Vector.summary(Vector.multiply(direction, t), point);

        if(isNaN(intersectPoint.x) || !isFinite(intersectPoint.x)) {
            console.log(point, t, intersectPoint);
            debugger;
        }

        for(let i = 0; i < polygon.points.length; i++) {
            const p1 = polygon.points[i];
            const p2 = polygon.points[(i + 1) % polygon.points.length];

            const side1: Point = Vector.subtract(p2, p1);
            const side2: Point = Vector.subtract(intersectPoint, p1);

            let crossProduct: Point = Vector.cross(side1, side2);

            if(Vector.dot(polygon.getNormal(), crossProduct) <= 1) {
                return null;
            }
        }

        return intersectPoint;
    }

    public static areCoDirected(pt1: Point, pt2: Point): boolean {
        // calculate ratios for each pair of coordinates
        const ratioX = pt1.x / pt2.x;
        const ratioY = pt1.y / pt2.y;
        const ratioZ = pt1.z / pt2.z;

        if(isNaN(ratioX) || isNaN(ratioY) || isNaN(ratioZ)) {
            return false;
        }

        // check if each ratio is approximately equal to the other ratios (with epsilon precision)
        const epsilon = Math.pow(10, -14);

        if(Math.abs(ratioX - ratioY) > epsilon ||
            Math.abs(ratioX - ratioZ) > epsilon ||
            Math.abs(ratioY - ratioZ) > epsilon) {
            return false;
        }

        // vectors are co-directed
        return true;
    }
}
