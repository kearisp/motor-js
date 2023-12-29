import {Point} from "../types/Point";
import {Vector} from "./Vector";
import {Polygon} from "./Polygon";
import {Observable} from "../events/Observable";
import {calcDirectionMatrix} from "../utils/calcDirectionMatrix";


type ModelEvents = {
    click: {
        type: "click";
    };
};

export class Model extends Observable<ModelEvents> {
    protected id?: string;
    protected scale: number = 1;
    protected position: Point;
    protected rotation: number = 0;
    protected rotationDirection: Point = {x: 0, y: 1, z: 0};
    protected rotationMatrix: number[][];
    protected points: Point[] = [];
    protected polygons: number[][] = [];

    public constructor(position?: Point) {
        super();

        this.position = position || {x: 0, y: 0, z: 0};

        this.rotationMatrix = this.calcDirectionMatrix();
    }

    public getId(): string|undefined {
        return this.id;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getPosition(): Point {
        return this.position;
    }

    public setPosition(position: Point): void {
        this.position = position;
    }

    public getPoints(): Point[] {
        return this.points.map((point) => {
            return this.getRotatedPoint(point);
        });
    }

    public getPolygons(): number[][] {
        return this.polygons;
    }

    public getPolygons2(): Polygon[] {
        return this.polygons.map((indexes) => {
            const points = indexes.map((index) => {
                return this.points[index];
            });

            return new Polygon(points);
        });
    }

    public getScale(): number {
        return this.scale;
    }

    public setScale(scale: number): void {
        this.scale = Math.min(Math.max(scale, 1), 0);
    }

    public setDirection(direction: Point): void {
        this.rotationDirection = Vector.normalize(direction);
        this.rotationMatrix = this.calcDirectionMatrix();
    }

    public rotate(angle: number, direction?: Point): void {
        this.rotation = angle;

        if(direction) {
            this.rotationDirection = Vector.normalize(direction);
        }

        this.rotationMatrix = this.calcDirectionMatrix();
    }

    protected calcDirectionMatrix(): number[][] {
        return calcDirectionMatrix(this.rotationDirection, this.rotation);
    }

    protected getRotatedPoint(point: Point): Point {
        return {
            x: point.x * this.rotationMatrix[0][0] + point.y * this.rotationMatrix[0][1] + point.z * this.rotationMatrix[0][2],
            y: point.x * this.rotationMatrix[1][0] + point.y * this.rotationMatrix[1][1] + point.z * this.rotationMatrix[1][2],
            z: point.x * this.rotationMatrix[2][0] + point.y * this.rotationMatrix[2][1] + point.z * this.rotationMatrix[2][2]
        };
    }
}
