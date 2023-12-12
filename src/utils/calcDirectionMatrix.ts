import {Point} from "../types/Point";


export const calcDirectionMatrix = (direction: Point, angle: number) => {
    const rotationAngle = angle * (Math.PI / 180);

    const cosAngle = Math.cos(rotationAngle);
    const sinAngle = Math.sin(rotationAngle);

    return [
        [
            cosAngle + direction.x ** 2 * (1 - cosAngle),
            direction.x * direction.y * (1 - cosAngle) - direction.z * sinAngle,
            direction.x * direction.z * (1 - cosAngle) + direction.y * sinAngle
        ],
        [
            direction.y * direction.x * (1 - cosAngle) + direction.z * sinAngle,
            cosAngle + direction.y ** 2 * (1 - cosAngle),
            direction.y * direction.z * (1 - cosAngle) - direction.x * sinAngle
        ],
        [
            direction.z * direction.x * (1 - cosAngle) - direction.y * sinAngle,
            direction.z * direction.y * (1 - cosAngle) + direction.x * sinAngle,
            cosAngle + direction.z ** 2 * (1 - cosAngle)
        ]
    ];
};
