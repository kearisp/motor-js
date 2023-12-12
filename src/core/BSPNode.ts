import {Point} from "../types/Point";


type Type = "coplanar" | "front" | "back";

export class BSPNode {
    public root: Point[];
    public front: BSPNode | null;
    public back: BSPNode | null;

    public constructor([root, ...polygons]: Point[][]) {
        const front: Point[][] = [];
        const back: Point[][] = [];

        this.root = root;

        for(const polygon of polygons) {
            const type = this.classifyPolygon(polygon);

            switch(type) {
                case "front":
                    front.push(polygon);
                    break;

                case "back":
                    back.push(polygon);
                    break;

                case "coplanar":
                    // TODO
                    break;
            }
        }

        this.front = front.length > 0 ? new BSPNode(front) : null;
        this.back = back.length > 0 ? new BSPNode(back) : null;
    }

    public classifyPolygon(polygon: Point[]): Type {
        return "" as Type;
    }

    public traverse(position: Point) {
        const type = this.classifyPolygon(this.root);

        switch(type) {
            case "front":
                if(this.back) {
                    this.back.traverse(position);
                }

                // render

                if(this.front) {
                    this.front.traverse(position);
                }
                break;

            case "back":
                if(this.front) {
                    this.front.traverse(position);
                }

                // render

                if(this.back) {
                    this.back.traverse(position);
                }
                break;

            case "coplanar":
                // TODO
                break;
        }
    }
}
