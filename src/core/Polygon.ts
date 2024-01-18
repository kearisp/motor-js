import {Vector} from "./Vector";
import {BSPNode} from "./BSPNode";
import {Camera} from "./Camera";
import {Polygon2D} from "./Polygon2D";
import {Point} from "../types/Point";
import {Point2D} from "../types/Point2D";


export class Polygon {
    public id?: string;
    public node?: BSPNode;
    public color?: string;
    public normal: Point;
    public center: Point;

    public constructor(
        public points: Point[],
        normal?: Point
    ) {
        this.normal = !normal ? this.calcNormal() : normal;
        this.center = this.calcCenter();
    }

    public setId(id: string) {
        this.id = id;
    }

    public intersects(polygon: Polygon): boolean {
        let axes = [
            ...Polygon.getNormals(this.points),
            ...Polygon.getNormals(polygon.points)
        ];

        for(let axis of axes) {
            let projection1 = Polygon.projection(this.points, axis);
            let projection2 = Polygon.projection(polygon.points, axis);

            if(projection1.max < projection2.min || projection2.max < projection1.min) {
                return false;
            }

            if(projection1.max === projection2.min || projection2.max === projection1.min) {
                return false;
            }
        }

        return true;
    }

    public smooth(): Polygon[] {
        return [];
    }

    public getNormal(): Point {
        return this.normal;
    }

    private calcNormal(): Point {
        let normal: Point = {
            x: 0,
            y: 0,
            z: 0
        };

        for(let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];
            const p3 = this.points[(i + 2) % this.points.length];

            const vector1 = Vector.subtract(p1, p2);
            const vector2 = Vector.subtract(p1, p3);

            const cross = Vector.cross(vector1, vector2);

            normal = Vector.summary(normal, cross);
        }

        return Vector.normalize({
            x: normal.x / this.points.length,
            y: normal.y / this.points.length,
            z: normal.z / this.points.length
        });
    }

    public getCenter(): Point {
        return this.center;
    }

    private calcCenter(): Point {
        let center: Point = {
            x: 0,
            y: 0,
            z: 0
        };

        for(let i = 0; i < this.points.length; i++) {
            center = Vector.summary(this.points[i], center);
        }

        return {
            x: center.x / this.points.length,
            y: center.y / this.points.length,
            z: center.z / this.points.length,
        };
    }

    public getVector1(): Point {
        // return Vector.normalize(Vector.subtract(this.points[0], this.points[1]));
        return Vector.normalize(Vector.cross(this.getNormal(), {x: 0, y: 0, z: -1}));
    }

    public getVector2(): Point {
        // return Vector.normalize(Vector.cross(this.getVector1(), this.getNormal()));
        return Vector.normalize(Vector.cross(this.getNormal(), {x: 1, y: 0, z: 0}));
    }

    public isOnSamePlane(p: Point): boolean {
        const [point] = this.points;

        if(!point) {
            return false;
        }

        const normal = this.getNormal();
        const dot = Vector.dot(Vector.subtract(p, point), normal);

        return Math.abs(dot) < 0.0001;
    }

    public isContainPoint(p: Point): boolean {
        return this.isContainPointV2(p);
    }

    protected isContainPointV1(point: Point): boolean {
        let inside = false;

        for(let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];
            const p3 = this.points[(i + 2) % this.points.length];

            const v0 = Vector.subtract(p3, p1);
            const v1 = Vector.subtract(p2, p1);
            const v2 = Vector.subtract(point, p1);

            const dot00 = Vector.dot(v0, v0);
            const dot01 = Vector.dot(v0, v1);
            const dot02 = Vector.dot(v0, v2);
            const dot11 = Vector.dot(v1, v1);
            const dot12 = Vector.dot(v1, v2);

            const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
            const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
            const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

            if((u >= 0) && (v >= 0) && (u + v < 1)) {
                inside = true;
                break;
            }
        }

        return inside;
    }

    protected isContainPointV2(point: Point): boolean {
        let sum = 0;

        for(let i = 0; i < this.points.length; i++) {
            const a1 = this.points[i];
            const a2 = this.points[(i + 1) % this.points.length];
            const vector = Vector.subtract(a2, a1);

            const t = Vector.dot(vector, Vector.subtract(point, a1)) / Vector.dot(vector, vector);

            const epsilon = 0.000001;
            if(t > epsilon && t < (1 - epsilon)) {
                sum += Vector.angle(Vector.subtract(a2, point), Vector.subtract(a1, point));
            }
        }

        return Math.abs(sum - Math.PI * 2) <= 0.01;
    }

    protected isContainPointV3(point: Point): boolean {
        for(let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];

            const side1: Point = Vector.subtract(p2, p1);
            const side2: Point = Vector.subtract(point, p1);

            let crossProduct: Point = Vector.cross(side1, side2);

            if(Vector.dot(this.getNormal(), crossProduct) <= -1) {
                return false;
            }
        }

        return true;
    }

    public project(camera?: Camera): Polygon2D {
        const points: Point2D[] = this.points.map((point: Point): Point2D => {
            if(!camera) {
                return {
                    x: point.x,
                    y: point.y
                };
            }

            return camera.projectPoint(point);
        }).filter((point: Point2D) => {
            return !isNaN(point.x) && !isNaN(point.y);
        });

        return new Polygon2D(points);
    }

    public project2() {
        type Point = {
            x: number;
            y: number;
            z: number;
        };

        type Vector = {
            x: number;
            y: number;
            z: number;
        };

        function dotProduct(n: Vector, p: Point): number {
            return n.x*p.x + n.y*p.y + n.z*p.z;
        }

        function scaleVector(n: Vector, scalar: number): Vector {
            return {
                x: n.x * scalar,
                y: n.y * scalar,
                z: n.z * scalar
            }
        }

        function pointDifference(a: Point, b: Point): Point {
            return {
                x: a.x - b.x,
                y: a.y - b.y,
                z: a.z - b.z
            }
        }

        function projectPointOnPlane(p: Point, n: Vector) : Point {
            let scaledN = scaleVector(n, dotProduct(n, p));
            return pointDifference(p, scaledN);
        }

        const projectedPoints = this.points.map((point) => {
            return projectPointOnPlane(point, Vector.subtract(this.points[0], this.points[1]));
        });

        return new Polygon2D(projectedPoints);
    }

    public static isIntersect(A: Polygon, B: Polygon): boolean {
        return false;
    }

    public static intersect(A: Polygon, B: Polygon): Polygon[] {
        let before: Point[] = [];
        let after: Point[] = [];

        let isBefore = true;

        for(let i = 0; i < A.points.length; i++) {
            const a1 = A.points[i];
            const a2 = A.points[(i + 1) % A.points.length];
            const vector = Vector.subtract(a2, a1);

            if(isBefore) {
                before.push(a1);
            }
            else {
                after.push(a1);
            }

            for(let j = 0; j < B.points.length; j++) {
                const b1 = B.points[j];
                const b2 = B.points[(j + 1) % B.points.length];
                const b3 = B.points[(j + 2) % B.points.length];

                const intersectPoint = Vector.intersectPlane(a1, vector, b1, b2, b3);

                if(intersectPoint && Vector.distance(Vector.subtract(a1, intersectPoint)) < 0) {
                    continue;
                }

                if(intersectPoint && A.isContainPoint(intersectPoint)) {
                    // if(debug) {
                    //     console.log("intersectPoint:", intersectPoint);
                    // }

                    before.push(intersectPoint);
                    after.push(intersectPoint);

                    isBefore = !isBefore;
                    break;
                }
            }
        }

        if(after.length === 0) {
            return [A];
        }

        const ABefore = new Polygon(before);
        ABefore.setId(`${A.id}.before`);
        ABefore.color = A.color;

        const AAfter = new Polygon(after);
        AAfter.setId(`${A.id}.after`);
        AAfter.color = A.color;

        return [ABefore, AAfter];
    }

    private static getNormals(points: Point[]): Point[] {
        let normals: Point[] = [];

        for(let i = 0; i < points.length; i++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % points.length];

            let edge = {
                x: p2.x - p1.x,
                y: p2.y - p1.y,
                z: p2.z - p1.z
            };

            let normal = {
                x: -edge.y,
                y: edge.x,
                z: edge.z
            };

            normals.push(normal);
        }

        return normals;
    }

    private static projection(points: Point[], axis: Point): {min: number, max: number} {
        let min = axis.x * points[0].x + axis.y * points[0].y;
        let max = min;

        for(let i = 1; i < points.length; i++) {
            let p = axis.x * points[i].x + axis.y * points[i].y;

            if(p < min) {
                min = p;
            }
            else if(p > max) {
                max = p;
            }
        }

        return {min, max};
    }

    public triangulate(debug = false): Polygon[] {
        return this.triangulateV1(debug);
    }

    protected triangulateV1(debug = false): Polygon[] {
        const polygons: Polygon[] = [];
        const points = this.points.slice();

        while(points.length > 3) {
            let hasCut = false;

            for(let i = 0; i < points.length; i++) {
                if(points.length === 3) {
                    break;
                }

                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];
                const p3 = points[(i + 2) % points.length];

                const center: Point = {
                    x: (p1.x + p3.x) / 2,
                    y: (p1.y + p3.y) / 2,
                    z: (p1.z + p3.z) / 2
                };

                if(this.isContainPoint(center)) {
                    const polygon = new Polygon([p1, p2, p3]);

                    polygon.color = this.color;

                    polygons.push(polygon);

                    points.splice((i + 1) % points.length, 1);
                    hasCut = true;
                }
            }

            if(!hasCut) {
                break;
            }
        }

        const polygon = new Polygon(points);

        polygon.color = this.color;

        polygons.push(polygon);

        return polygons;
    }
}
