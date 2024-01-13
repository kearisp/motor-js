import {Polygon} from "./Polygon";
import {Vector} from "./Vector";
import {Camera} from "./Camera";
import {Point} from "../types/Point";


type Type = "coplanar" | "front" | "back";
type Render = (polygon: Polygon) => void;

export class BSPNode {
    public root: Polygon;
    public front: BSPNode | null;
    public back: BSPNode | null;
    protected debug: boolean = false;
    protected camera: Camera;

    public constructor(polygons: Polygon[], camera: Camera, debug: boolean = false) {
        this.camera = camera;

        const front: Polygon[] = [];
        const back: Polygon[] = [];

        const [root, ...rest] = polygons.sort((a, b) => {
            // return Vector.distance(b.getCenter()) - Vector.distance(a.getCenter());
            return Vector.distance(a.getCenter()) - Vector.distance(b.getCenter());
        });

        this.root = root;
        this.debug = debug;

        for(const polygon of rest) {
            const intersects = Polygon.intersect(polygon, root);

            for(const intersect of intersects) {
                const type = this.classifyPolygon(intersect);

                switch(type) {
                    case "front":
                        front.push(intersect);
                        break;

                    case "back":
                        back.push(intersect);
                        break;

                    case "coplanar":
                        // TODO

                        if(this.debug) {
                            console.log(type, this.root, intersect);
                        }
                        break;
                }
            }
        }

        this.front = front.length > 0 ? new BSPNode(front, camera, this.debug) : null;
        this.back = back.length > 0 ? new BSPNode(back, camera, this.debug) : null;
    }

    public classifyPolygon(polygon: Polygon): Type {
        return this.isInFront(polygon) ? "front" : "back";
    }

    protected isInFront(polygon: Polygon): boolean {
        return this.isInFrontV1(polygon);
        // return this.isInFrontV2(polygon);
    }

    protected isInFrontV1(polygon: Polygon): boolean {
        const vector = Vector.subtract(this.root.getCenter(), polygon.getCenter());

        return Vector.dot(this.root.getNormal(), vector) < 0;
    }

    protected isInFrontV2(polygon: Polygon): boolean {
        const direction = {
            x: 0,
            y: 0,
            z: -1
        };

        const viewVector = Vector.subtract(this.root.getCenter(), direction);

        const normal = this.root.getNormal();

        const dotProduct = Vector.dot(normal, viewVector);
        const magnitudeProduct = Vector.magnitude(normal) * Vector.magnitude(viewVector);
        const cosTheta = dotProduct / magnitudeProduct;

        return cosTheta > 0;
    }

    public traverse(direction: Point, render: Render): void {
        if(!this.root) {
            return;
        }

        this.traverseV1(direction, render);
        // this.traverseV2(direction, render);
    }

    protected traverseV1(direction: Point, render: Render): void {
        if(Vector.dot(this.root.getNormal(), direction) < 0) {
            if(this.front) {
                this.front.traverseV1(direction, render);
            }

            render(this.root);

            if(this.back) {
                this.back.traverseV1(direction, render);
            }
        }
        else {
            if(this.back) {
                this.back.traverseV1(direction, render);
            }

            render(this.root);

            if(this.front) {
                this.front.traverseV1(direction, render);
            }
        }
    }

    protected traverseV2(direction: Point, render: Render): void {
        let frontFirst = Vector.dot(this.root.getNormal(), direction) < 0;

        const v1 = this.root.getVector1();
        const v2 = this.root.getVector2();

        const p1 = Vector.multiply(v1, 100),
            p2 = Vector.multiply(v1, -100),
            p3 = Vector.summary(this.root.getCenter(), Vector.multiply(v2, -100)),
            p4 = Vector.summary(this.root.getCenter(), Vector.multiply(v2, 100));

        const d1 = this.camera.projectPoint(p1),
            d2 = this.camera.projectPoint(p2),
            d3 = this.camera.projectPoint(p3),
            d4 = this.camera.projectPoint(p4);

        const log = [
            // "\n", "p1=", {x: p1.x, y: p1.y},
            // "\n", "p2=", {x: p2.x, y: p2.y},
            "\n", "p3=", {x: p3.x, y: p3.y},
            "\n", "p4=", {x: p4.x, y: p4.y},
            // "\n", "d1=", d1,
            // "\n", "d2=", d2,
            "\n", "d3=", d3,
            "\n", "d4=", d4
        ];

        if(Math.abs(p3.x - p4.x) < 0.3 && p3.y > p4.y && d3.y < d4.y) {
            if(this.debug) {
                console.log(this.root.id, "y changed 1", ...log);
            }

            frontFirst = !frontFirst;
        }

        if(frontFirst) {
            if(this.front) {
                this.front.traverseV2(direction, render);
            }

            render(this.root);

            if(this.back) {
                this.back.traverseV2(direction, render);
            }
        }
        else {
            if(this.back) {
                this.back.traverseV2(direction, render);
            }

            render(this.root);

            if(this.front) {
                this.front.traverseV2(direction, render);
            }
        }
    }
}
