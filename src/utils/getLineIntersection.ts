import {Point} from "../types/Point";


export const getLineIntersection = (line1: [Point, Point], line2: [Point, Point]): Point | null => {
    const v1: Point = {
        x: line1[1].x - line1[0].x,
        y: line1[1].y - line1[0].y,
        z: line1[1].z - line1[0].z
    };

    const v2: Point = {
        x: line2[1].x - line2[0].x,
        y: line2[1].y - line2[0].y,
        z: line2[1].z - line2[0].z
    };

    const v3: Point = {
        x: line2[0].x - line1[0].x,
        y: line2[0].y - line1[0].y,
        z: line2[0].z - line1[0].z
    };

    const den: number = v1.x * v2.y * v3.z
                      + v2.x * v3.y * v1.z
                      + v3.x * v1.y * v2.z
                      - v1.x * v3.y * v2.z
                      - v2.x * v1.y * v3.z
                      - v3.x * v2.y * v1.z;

    // console.log(den)

    // if(den === 0) {
    //     return null;
    // }

    // const p1 = line1[0];
    // const p2 = line2[0];

    // const t = (v2.x * v3.y * (p1.z - p2.z) + v2.y * v3.z * (p2.x - p1.x) + v2.z * v3.x * (p1.y - p2.y)) / den;

    // return {
    //     x: p1.x + t * v1.x,
    //     y: p1.y + t * v1.y,
    //     z: p1.z + t * v1.z
    // };
    return null;
};
