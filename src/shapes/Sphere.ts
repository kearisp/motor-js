import {Model} from "../core/Model";
import {Point} from "../types/Point";


export class Sphere extends Model {
    public constructor(
        protected radius: number,
        position?: Point
    ) {
        super(position);
    }
}
