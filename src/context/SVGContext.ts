import {Point2D} from "../types/Point2D";
import {Context} from "../core/Context";
import {Polygon} from "../core/Polygon";
import {Model} from "../core/Model";
import {Camera} from "../core/Camera";
import {BSPNode} from "../core/BSPNode";


class SVGContext extends Context {
    protected svg: SVGSVGElement;
    protected strokeStyle: string = "#FFFFFF";
    protected fillStyle: string = "#FFFFFF";

    public constructor() {
        super();

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
    }

    public get domElement(): HTMLElement {
        return this.svg as unknown as HTMLElement;
    }

    protected createSVGElement(type: string) {
        return document.createElementNS("http://www.w3.org/2000/svg", type);
    }

    public setStrokeStyle(color: string) {
        this.strokeStyle = color;
    }

    public setFillStyle(color: string) {
        this.fillStyle = color;
    }

    public drawLine(start: Point2D, end: Point2D) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("x1", `${start.x}`);
        line.setAttribute("y1", `${start.y}`);
        line.setAttribute("x2", `${end.x}`);
        line.setAttribute("y2", `${end.y}`);
        line.setAttribute("stroke", this.strokeStyle);
        line.setAttribute("stroke-width", "1");

        this.svg.appendChild(line);
    }

    public fillRect(x: number, y: number, w: number, h: number) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        rect.setAttribute("x", `${x}`);
        rect.setAttribute("y", `${y}`);
        rect.setAttribute("width", `${w}`);
        rect.setAttribute("height", `${h}`);
        rect.setAttribute("fill", this.fillStyle);

        this.svg.appendChild(rect);
    }

    public fillPolygon(points: Point2D[]) {
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        polygon.setAttribute("style", `fill: ${this.fillStyle}`);
        polygon.setAttribute("points", points.map((point) => {
            return `${(point.x + 1) * this.width / 2},${(1 - point.y) * this.getHeight() / 2}`;
        }).join(" "));
        polygon.setAttribute("stroke-width", "0.9");
        polygon.setAttribute("stroke", "black");

        this.svg.append(polygon);
    }

    public clear() {
        while(this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }

    public render(models: Model[], camera: Camera): void {
        //
    }

    public renderPolygons(polygons: Polygon[], camera: Camera) {
        const bspNode = new BSPNode(polygons, camera, false);

        bspNode.traverse({x: 0, y: 0, z: 1}, (polygon: Polygon): void => {
            this.setStrokeStyle("#445555");
            this.setFillStyle(polygon.color || "#990000");
            this.fillPolygon(polygon.project(camera).points);
        });
    }
}


export {SVGContext};
