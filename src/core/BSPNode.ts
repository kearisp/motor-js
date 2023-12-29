import {Polygon} from "./Polygon";
import {Vector} from "./Vector";
import {Point} from "../types/Point";


type Type = "coplanar" | "front" | "back";
type Render = (polygon: Polygon) => void;

export class BSPNode {
    public root: Polygon;
    public front: BSPNode | null;
    public back: BSPNode | null;
    protected debug: boolean = false;

    public constructor([root, ...polygons]: Polygon[], debug: boolean = false) {
        this.root = root;
        this.debug = debug;

        const front: Polygon[] = [];
        const back: Polygon[] = [];

        for(const polygon of polygons) {
            const intersects = Polygon.intersect(polygon, root, this.debug);

            for(const intersect of intersects) {
                const type = this.classifyPolygon(intersect);

                // if(this.debug) {
                //     console.log(type, this.root.id, intersect.id);
                // }

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

        this.front = front.length > 0 ? new BSPNode(front, this.debug) : null;
        this.back = back.length > 0 ? new BSPNode(back, this.debug) : null;
    }

    public classifyPolygon(polygon: Polygon): Type {
        // return this.classifyPolygonV1(polygon);
        // return this.classifyPolygonV2(polygon);
        // return this.classifyPolygonV3(polygon);
        return this.classifyPolygonV4(polygon);
    }

    public classifyPolygonV1(polygon: Polygon): Type {
        const epsilon = 0.00001; // for numerical stability
        // const epsilon = 0; // for numerical stability
        const dot = Vector.dot(this.root.getNormal(), polygon.getNormal());

        if(dot > epsilon) {
            return "front";
        }
        else if(dot < -epsilon) {
            return "back";
        }
        else {
            return "coplanar";
        }
    }

    public classifyPolygonV2(polygon: Polygon): Type {
        const dot = Vector.dot(this.root.getNormal(), polygon.getNormal());

        if(dot > 0) {
            return "front";
        }

        return "back";
    }

    public classifyPolygonV3(polygon: Polygon): Type {
        return this.root.getCenter().z > polygon.getCenter().z ? "front" : "back";
    }

    public classifyPolygonV4(polygon: Polygon): Type {
        return this.isInFrontV3(polygon) ? "front" : "back";
    }

    private isInFront(position: Point, direction: Point) {
        // const viewVector = Vector.subtract(this.root.points[0], position);
        // const viewVector = Vector.subtract(this.root.getCenter(), position);
        const viewVector = this.root.getCenter();
        const viewDotProduct = Vector.dot(viewVector, direction);

        if(viewDotProduct < 0) {
            return false;
        }

        return Vector.dot(viewVector, this.root.getNormal()) > 0;
    }

    private isInFrontV2(polygon: Polygon) {
        return this.root.getCenter().z > polygon.getCenter().z;
    }

    private isInFrontV3(polygon: Polygon) {
        const vector = Vector.subtract(this.root.getCenter(), polygon.getCenter());

        return Vector.dot(this.root.getNormal(), vector) < 0;
        // const position = {
        //     x: 0,
        //     y: 0,
        //     z: -100
        // };
        //
        // return Vector.dot(position, this.root.getCenter()) < Vector.dot(position, polygon.getCenter());
        // return Vector.dot(this.root.getCenter(), polygon.getCenter());
    }

    public traverse(position: Point, direction: Point, render: Render): void {
        if(!this.root) {
            return;
        }

        // this.traverseV1(position, direction, render);
        // this.traverseV2(position, direction, render);
        // this.traverseV3(position, direction, render);
        this.traverseV4(direction, render);
    }

    public traverseV1(position: Point, direction: Point, render: Render) {
        let type = this.isInFront(position, direction) ? "front" : "back";
        // let type = this.isInFrontV2();

        if(type === "back" && this.classifyPolygon(this.root) === "back") {
            type = "front";
        }

        switch(type) {
            case "front":
                if(this.back) {
                    this.back.traverseV1(position, direction, render);
                }

                render(this.root);

                if(this.front) {
                    this.front.traverseV1(position, direction, render);
                }
                break;

            case "back":
                if(this.front) {
                    this.front.traverseV1(position, direction, render);
                }

                render(this.root);

                if(this.back) {
                    this.back.traverseV1(position, direction, render);
                }
                break;

            // case "coplanar":
            //     render(this.root);
            //     break;
        }
    }

    public traverseV2(position: Point, direction: Point, render: Render): void {
        if(Vector.areCoDirected(direction, this.root.getNormal())) {
            if(Vector.dot(position, this.root.getNormal()) >= 0) {
                if(this.back) {
                    this.back.traverseV2(position, direction, render);
                }

                render(this.root);

                if(this.front) {
                    this.front.traverseV2(position, direction, render);
                }
            }
            else {
                if(this.front) {
                    this.front.traverseV2(position, direction, render);
                }
            }
        }
        else {
            if(Vector.dot(position, this.root.getNormal()) >= 0) {
                if(this.front) {
                    this.front.traverseV2(position, direction, render);
                }

                render(this.root);

                if(this.back) {
                    this.back.traverseV2(position, direction, render);
                }
            }
            else {
                // if(this.front) {
                //     this.front.traverseV2(position, direction, render);
                // }
                //
                // render(this.root);

                if(this.back) {
                    this.back.traverseV2(position, direction, render);
                }
            }
        }
    }

    public traverseV3(position: Point, direction: Point, render: Render): void {
        if(Vector.areCoDirected(direction, this.root.getNormal())) {
            if(Vector.dot(position, this.root.getNormal()) >= 0) {
                if(this.front) {
                    this.front.traverseV3(position, direction, render);
                }
            }
            else {
                if(this.front) {
                    this.front.traverseV3(position, direction, render);
                }

                render(this.root);

                if(this.back) {
                    this.back.traverseV3(position, direction, render);
                }
            }
        }
        else {
            if(Vector.dot(position, this.root.getNormal()) >= 0) {
                if(this.back) {
                    this.back.traverseV3(position, direction, render);
                }

                render(this.root);

                if(this.front) {
                    this.front.traverseV3(position, direction, render);
                }
            }
            else {
                if(this.back) {
                    this.back.traverseV3(position, direction, render);
                }
            }
        }
    }

    public traverseV4(direction: Point, render: Render): void {
        // if(this.debug) {
        //     console.log(this.root.id, Vector.dot(direction, this.root.getNormal()));
        // }

        if(Vector.dot(this.root.getNormal(), direction) < 0) {
            if(this.front) {
                this.front.traverseV4(direction, render);
            }

            render(this.root);

            if(this.back) {
                this.back.traverseV4(direction, render);
            }
        }
        else {
            if(this.back) {
                this.back.traverseV4(direction, render);
            }

            render(this.root);

            if(this.front) {
                this.front.traverseV4(direction, render);
            }
        }
    }
}
