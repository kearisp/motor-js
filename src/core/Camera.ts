import {Context} from "./Context";
import {DataProvider} from "./DataProvider";
import {Model} from "./Model";
import {Vector} from "./Vector";
import {Polygon} from "./Polygon";
import {Point} from "../types/Point";
import {Point2D} from "../types/Point2D";
import {calcCameraRotationMatrixV2} from "../utils/calcCameraRotationMatrix";


export class Camera {
    protected debug: boolean = false;
    protected isRunning = false;
    protected fov: number = 100;
    protected pitch: number = 0;
    protected yaw: number = 0;
    protected roll: number = 0;
    protected rotationMatrix: number[][];

    public constructor(
        protected context: Context,
        protected dataProvider: DataProvider,
        protected position: Point = {x: 0, y: 0, z: 0},
        protected direction: Point = {x: 0, y: 0, z: 1}
    ) {
        this.rotationMatrix = this.calcDirectionMatrix();
    }

    public getPosition(): Point {
        return this.position;
    }

    public setPosition(position: Point): void {
        this.position = {
            ...position
        };

        this.rotationMatrix = this.calcDirectionMatrix();
    }

    protected calcDirectionMatrix() {
        return calcCameraRotationMatrixV2(this.position, this.direction);
    }

    public toCameraPoint(point: Point) {
        //
    }

    public rotatePoint(point: Point): Point {
        const matrix = this.rotationMatrix;

        const x = point.x * matrix[0][0] + point.y * matrix[1][0] + point.z * matrix[2][0] + matrix[3][0];
        const y = point.x * matrix[0][1] + point.y * matrix[1][1] + point.z * matrix[2][1] + matrix[3][1];
        const z = point.x * matrix[0][2] + point.y * matrix[1][2] + point.z * matrix[2][2] + matrix[3][2];
        // const w = point.x * matrix[0][3] + point.y * matrix[1][3] + point.z * matrix[2][3] + matrix[3][3];
        const w = 1;

        return {
            x: x / w,
            y: y / w,
            z: z / w
        };
    }

    public projectPoint(point: Point): Point2D {
        const {x, y, z} = this.rotatePoint(point);

        if(z / 3 <= -this.fov) {
            return {x: NaN, y: NaN};
        }

        const scale = this.fov / (this.fov + z / 3);

        return {
            x: scale * x,
            y: scale * y
        };
    }

    public getFov(): number {
        return this.fov;
    }

    public setFov(fov: number): void {
        this.fov = fov;
    }

    public getDirection(): Point {
        return this.direction;
    }

    public getDirectionLeft(): Point {
        return Vector.cross(this.direction, {
            x: 0,
            y: 1,
            z: 0
        });
    }

    public setDirection(direction: Point): void {
        this.direction = Vector.normalize(direction);
        this.rotationMatrix = this.calcDirectionMatrix();
    }

    public setDirectionFromAngles(pitch: number, yaw: number) {
        this.pitch = Math.max(Math.min(pitch, 90), -90);
        this.yaw = yaw;

        const pitchRadians = this.pitch * (Math.PI / 180),
            yawRadians = this.yaw * (Math.PI / 180);

        this.setDirection({
            x: Math.cos(pitchRadians) * Math.sin(yawRadians),
            y: Math.sin(pitchRadians),
            z: Math.cos(pitchRadians) * Math.cos(yawRadians)
        });
    }

    public getYaw() {
        // return Math.atan2(this.direction.z, this.direction.x) * (180 / Math.PI);
        return this.yaw;
    }

    public getPitch() {
        // return Math.asin(this.direction.y) * (180 / Math.PI);
        return this.pitch;
    }

    public setPitch(pitch: number) {
        this.setDirectionFromAngles(pitch, this.yaw);
    }

    public setYaw(yaw: number) {
        this.setDirectionFromAngles(this.pitch, yaw);
    }

    public update() {
        this.context.clear();

        const polygons = this.dataProvider.getModels().reduce((polygons: Polygon[], model: Model, modelIndex: number) => {
            const position = model.getPosition();
            const points = model.getPoints();

            return [
                ...polygons,
                ...model.getPolygons().map((indexes, polygonIndex) => {
                    const polygonPoints = indexes.map((index) => {
                        const point = points[index];

                        return {
                            x: position.x + point.x - this.position.x,
                            y: position.y + point.y - this.position.y,
                            z: position.z + point.z - this.position.z
                        };
                    });

                    const polygon = new Polygon(polygonPoints);

                    polygon.setId(`#${model.getId()}.${polygonIndex}`);

                    const d = -100;
                    let direction = {
                        x: this.direction.x * d,
                        y: this.direction.y * d,
                        z: this.direction.z * d
                    };
                    direction = Vector.subtract(this.position, direction);

                    const sum: number = polygon.points.reduce((sum: number, point: Point, index) => {
                        const point1 = point;
                        const point2 = polygon.points[polygon.points.length === index + 1 ? 0 : index + 1];

                        const vector1 = Vector.subtract(point2, point1);
                        const vector2 = Vector.subtract(point1, direction);

                        const p = Vector.cross(vector1, vector2);

                        // console.log(Vector.distance(p) / Vector.distance(vector1));

                        const distance = Vector.distance(p) / Vector.distance(vector1);

                        // if(this.debug) {
                        //     this.debug = false;
                        //     debugger;
                        // }

                        return sum + distance;
                    }, 0);

                    polygon.sum = sum;
                    polygon.distance = sum / Math.max(polygon.points.length, 1);
                    polygon.color = `hsl(${modelIndex * 100}, 100%, 50%)`;

                    return polygon;
                })
            ];
        }, []).sort((a, b) => {
            return b.distance - a.distance;
        });

        for(const polygon of polygons) {
            const polygonPoints = polygon.points.map((point) => {
                const {x, y} = this.projectPoint(point);

                return {
                    x: this.context.getWidth() / 2 + x,
                    y: this.context.getHeight() / 2 - y
                };
            }).filter((point) => {
                return !isNaN(point.x) && !isNaN(point.y);
            });

            if(polygonPoints.length > 0) {
                this.context.setStrokeStyle("#000000");
                this.context.setFillStyle(polygon.color || "#CC0000");
                this.context.fillPolygon(polygonPoints);
            }
        }

        if(this.debug) {
            this.debug = false;

            polygons.forEach((polygon) => {
                console.info(polygon.id, polygon.distance, polygon);
            });

            debugger;
        }

        return polygons;
    }

    public run() {
        this.isRunning = true;

        this.loop();
    }

    public destroy() {
        this.isRunning = false;
    }

    public activateDebug() {
        this.debug = true;
    }

    protected loop() {
        if(!this.isRunning) {
            return;
        }

        requestAnimationFrame(() => {
            this.update();
            this.loop();
        });
    }
}
