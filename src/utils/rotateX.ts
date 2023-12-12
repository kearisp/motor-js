import {Point} from "../types/Point";
import {calcDirectionMatrix} from "./calcDirectionMatrix";


export const rotateX = (point: Point, angle: number) => {
    const matrix = calcDirectionMatrix({
        x: 1,
        y: 0,
        z: 0
    }, angle);

    return {
        x: point.x * matrix[0][0] + point.y * matrix[0][1] + point.z * matrix[0][2],
        y: point.x * matrix[1][0] + point.y * matrix[1][1] + point.z * matrix[1][2],
        z: point.x * matrix[2][0] + point.y * matrix[2][1] + point.z * matrix[2][2]
    };
};
