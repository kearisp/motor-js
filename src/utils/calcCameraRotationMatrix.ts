import {Vector} from "../core/Vector";
import {Point} from "../types/Point";


export const calcCameraRotationMatrixV1 = (eye: Point, center: Point, up: Point) => {
    let f = Vector.normalize(Vector.subtract(center, eye));
    let s = Vector.normalize(Vector.cross(f, up));
    let u = Vector.cross(s, f);

    return [
        [s.x, u.x, -f.x, 0],
        [s.y, u.y, -f.y, 0],
        [s.z, u.z, -f.z, 0],
        [-Vector.dot(s, eye), -Vector.dot(u, eye), Vector.dot(f, eye), 1]
    ];
};

export const calcCameraRotationMatrixV2 = (position: Point, direction: Point, up: Point = {x: 0, y: 1, z: 0}): number[][] => {
    const right = Vector.normalize(Vector.cross(up, direction));
    const newUp = Vector.normalize(Vector.cross(direction, right));

    return [
        [right.x, newUp.x, direction.x, position.x],
        [right.y, newUp.y, direction.y, position.y],
        [right.z, newUp.z, direction.z, position.z],
        [0, 0, 0, 1]
    ];
};
