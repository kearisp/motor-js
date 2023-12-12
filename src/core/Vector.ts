import {Point} from "../types/Point";


export class Vector {
    public constructor(
        public x: number,
        public y: number,
        public z: number
    ) {}

    get distance() {
        return Vector.distance(this);
    }

    private set(point: Point) {
        this.x = point.x;
        this.y = point.y;
        this.z = point.z;
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

    public static intersectPlane(point: Point, vector: Point, v1: Point, v2: Point, v3: Point): Point|null {
        return null;
    }

    public static intersectWithTriangle1(rayOrigin: Point, rayVector: Point, v0: Point, v1: Point, v2: Point): Point | null {
        const EPSILON = 0.0000001;
        const edge1 = Vector.subtract(v1, v0);
        const edge2 = Vector.subtract(v2, v0);
        const h = Vector.cross(rayVector, edge2);
        const a = Vector.dot(edge1, h);

        if (a > -EPSILON && a < EPSILON) // Лінія є паралельною до трикутника
            return null;

        const f = 1 / a;
        const s = Vector.subtract(rayOrigin, v0);
        const u = f * Vector.dot(s, h);

        if (u < 0.0 || u > 1.0) // перетин знаходиться поза трикутником
            return null;

        const q = Vector.cross(s, edge1);
        const v = f * Vector.dot(rayVector, q);

        if (v < 0.0 || u + v > 1.0) // перетин знаходиться поза трикутником
            return null;

        // Променя перетинає трикутник, отже обчислюємо точку перетину
        const t = f * Vector.dot(edge2, q);

        return Vector.summary(rayOrigin, Vector.multiply(rayVector, t));
    }

    public static intersectWithTriangle(rayOrigin: Point, rayVector: Point, v0: Point, v1: Point, v2: Point): Point | null {
        const EPSILON = 0.0000001;
        const edge1 = Vector.subtract(v1, v0);
        const edge2 = Vector.subtract(v2, v0);
        const planeNormal = Vector.cross(edge1, edge2);

        const denominator = Vector.dot(planeNormal, rayVector);

        if(Math.abs(denominator) < EPSILON) { // Лінія є паралельною до площини
            return null;
        }

        const t = Vector.dot(planeNormal, Vector.subtract(v0, rayOrigin)) / denominator;

        if(t < 0) { // перетин знаходиться поза прямолінійним відрізком
            return null;
        }

        // Обраховуємо і повертаємо точку перетину
        return Vector.summary(rayOrigin, Vector.multiply(rayVector, t));
    }
}
