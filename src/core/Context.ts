import {Polygon} from "./Polygon";
import {Model} from "./Model";
import {Camera} from "./Camera";


abstract class Context {
    protected width: number = 0;
    protected height: number = 0;
    protected fov: number = 45;
    protected models: Model[] = [];

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public setSizes(width: number, height: number) {
        this.setWidth(width);
        this.setHeight(height);
    }

    public setWidth(width: number): void {
        this.width = width;
    }

    public setHeight(height: number): void {
        this.height = height;
    }

    public getFov(): number {
        return this.fov;
    }

    public setFov(fov: number): void {
        this.fov = fov;
    }

    public addModel(model: Model): void {
        this.models.push(model);
    }

    public removeModel(model: Model): void {
        this.models = this.models.filter(m => m !== model);
    }

    public abstract get domElement(): HTMLElement;
    public abstract render(models: Model[], camera: Camera): void;
    public abstract renderPolygons(polygons: Polygon[], camera: Camera): void;
    public abstract clear(): void;
}


export {Context};
