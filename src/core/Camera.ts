import {mat4} from "gl-matrix";

import {Context} from "./Context";
import {Vector} from "./Vector";
import {Point} from "../types/Point";
import {Point2D} from "../types/Point2D";
import {Observable} from "../events/Observable";
import {calcCameraRotationMatrixV2} from "../utils/calcCameraRotationMatrix";


export class Camera extends Observable<ListenerTypes> {
    protected isDebug: boolean = false;
    protected fov: number = 45;
    protected pitch: number = 0;
    protected yaw: number = 0;
    protected roll: number = 0;
    protected position: Vector;
    protected direction: Vector;
    protected rotationMatrix: number[][];

    public constructor(
        protected context: Context,
        position: Point = {x: 0, y: 0, z: 0},
        direction: Point = {x: 0, y: 0, z: 1}
    ) {
        super();

        this.position = Vector.fromPoint(position);
        this.direction = Vector.fromPoint(direction);
        this.rotationMatrix = this.calcDirectionMatrix();
    }

    public getPosition(): Point {
        return this.position;
    }

    public setPosition(position: Point): void {
        this.position.set(position);

        this.rotationMatrix = this.calcDirectionMatrix();

        this.emit("positionChange", {
            position: this.position
        });
    }

    protected calcDirectionMatrix() {
        return calcCameraRotationMatrixV2(this.position, this.direction);
    }

    public getProjectionMatrix() {
        const fieldOfView = (this.fov * Math.PI) / 180; // in radians
        const aspect = this.context.getWidth() / this.context.getHeight();
        const zNear = 0.1;
        const zFar = 3000.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        const matrix: number[][] = [];

        for(let i = 0; i < 4; i++) {
            matrix[i] = [
                projectionMatrix[i * 4],
                projectionMatrix[i * 4 + 1],
                projectionMatrix[i * 4 + 2],
                projectionMatrix[i * 4 + 3]
            ];
        }

        return matrix;
    }

    public transformPointToCameraView(point: Point): Point {
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

    public projectPoint(point: Point): Point {
        const projected = this.projectPointV2(point);

        if(Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1) {
            return {
                x: NaN,
                y: NaN,
                z: NaN
            };
        }

        return projected;
    }

    public projectPointV1(point: Point): Point2D {
        const {x, y, z} = point;

        if(z / 3 <= -this.fov) {
            return {x: NaN, y: NaN};
        }

        const scale = this.fov / (this.fov + z / 3);
        // const scale = 1;

        return {
            x: scale * x,
            y: scale * y
        };
    }

    public projectPointV2(point: Point): Point {
        const matrix = this.getProjectionMatrix();

        const x = point.x * matrix[0][0] + point.y * matrix[1][0] + point.z * matrix[2][0] + matrix[3][0];
        const y = point.x * matrix[0][1] + point.y * matrix[1][1] + point.z * matrix[2][1] + matrix[3][1];
        const z = point.x * matrix[0][2] + point.y * matrix[1][2] + point.z * matrix[2][2] + matrix[3][2];
        const w = point.x * matrix[0][3] + point.y * matrix[1][3] + point.z * matrix[2][3] + matrix[3][3];

        return  {
            x: x / w,
            y: y / w,
            z: z / w
        };
    }

    public getFov(): number {
        return this.fov;
    }

    public setFov(fov: number): void {
        this.fov = fov;

        this.emit("fovChange", {
            fov: this.fov
        });
    }

    public setDebug(debug: boolean) {
        this.isDebug = debug;
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
        this.direction.set(direction) //= Vector.normalize(direction);
        this.rotationMatrix = this.calcDirectionMatrix();

        this.emit("directionChange", {
            direction: this.direction,
            pitch: this.pitch,
            yaw: this.yaw
        });
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

    public getPitch() {
        // return Math.asin(this.direction.y) * (180 / Math.PI);
        return this.pitch;
    }

    public setPitch(pitch: number) {
        this.setDirectionFromAngles(pitch, this.yaw);
    }

    public getYaw() {
        // return Math.atan2(this.direction.z, this.direction.x) * (180 / Math.PI);
        return this.yaw;
    }

    public setYaw(yaw: number) {
        this.setDirectionFromAngles(this.pitch, yaw);
    }

    public getRoll(): number {
        return this.roll;
    }

    public setRoll(roll: number): void {
        this.roll = roll;
    }
}


export type CameraFovChangeEvent = {
    fov: number;
};

export type CameraPositionChangeEvent = {
    position: Point;
};

export type CameraDirectionChangeEvent = {
    direction: Point;
    pitch: number;
    yaw: number;
};

type ListenerTypes = {
    positionChange: CameraPositionChangeEvent;
    directionChange: CameraDirectionChangeEvent;
    fovChange: CameraFovChangeEvent;
};
