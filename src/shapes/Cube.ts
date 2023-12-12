import {Model} from "../core/Model";
import {Point} from "../types/Point";


export class Cube extends Model {
    public constructor(
        protected width: number,
        protected height: number,
        protected depth: number,
        position?: Point
    ) {
        super(position);

        this.points = [
            {x: -width / 2, y: -height / 2, z: -depth / 2},   // 0
            {x: width / 2, y: -height / 2, z: -depth / 2},    // 1
            {x: width / 2, y: height / 2, z: -depth / 2},     // 2
            {x: -width / 2, y: height / 2, z: -depth / 2},    // 3

            {x: -width / 2, y: -height / 2, z: depth / 2},    // 4
            {x: width / 2, y: -height / 2, z: depth / 2},     // 5
            {x: width / 2, y: height / 2, z: depth / 2},      // 6
            {x: -width / 2, y: height / 2, z: depth / 2}      // 7
        ];

        this.polygons = [
            [0, 1, 2, 3],
            [1, 2, 6, 5],
            [4, 5, 6, 7],
            [0, 4, 7, 3],
            [7, 3, 2, 6],
            [0, 1, 5, 4]
        ];
    }
}