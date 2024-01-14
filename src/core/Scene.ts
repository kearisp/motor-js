import {SVGContext} from "../context/SVGContext";
import {CanvasContext} from "../context/CanvasContext";
import {WebGLContext} from "../context/WebGLContext";
import {Camera} from "./Camera";
import {Context} from "./Context";
import {DataProvider} from "./DataProvider";
import {Model} from "./Model";
import {Polygon} from "./Polygon";
import {Point} from "../types/Point";


class Scene {
    protected camera: Camera;
    protected context: Context;
    protected dataProvider: DataProvider;
    protected isLooping = false;
    protected isDebug = false;
    protected models: Model[] = [];

    public constructor(context: "svg" | "canvas" | "webgl" | Context) {
        switch(context) {
            case "svg":
                this.context = new SVGContext();
                break;

            case "canvas":
                this.context = new CanvasContext();
                break;

            case "webgl":
                this.context = new WebGLContext();
                break;

            default:
                this.context = context;
                break;
        }

        this.dataProvider = new DataProvider();
        this.camera = new Camera(this.context);
    }

    public getContext() {
        return this.context;
    }

    public getCamera() {
        return this.camera;
    }

    public requestPointerLock(): void {
        this.context.domElement.requestPointerLock();
    }

    public debug(): void {
        this.isDebug = true;
        this.camera.setDebug(true);
        this.context.setDebug(true);
    }

    protected debugger(): boolean {
        if(this.isDebug) {
            this.isDebug = false;
            this.camera.setDebug(false);
            this.context.setDebug(false);

            return true;
        }

        return this.isDebug;
    }

    public update(): void {
        this.context.clear();

        const polygons = this.models.map((model: Model, modelIndex) => {
            const position = model.getPosition();
            const points = model.getPoints();

            return model.getPolygons().map((indexes, polygonIndex) => {
                const polygonPoints = indexes.map((index) => {
                    const point = points[index];

                    return this.camera.transformPointToCameraView({
                        x: position.x + point.x - this.camera.getPosition().x,
                        y: position.y + point.y - this.camera.getPosition().y,
                        z: position.z + point.z - this.camera.getPosition().z
                    });
                });

                const polygon = new Polygon(polygonPoints);

                polygon.setId(`${model.getId()}.${polygonIndex}`)
                polygon.color = `hsla(${(modelIndex) * 100 + polygonIndex * 15}, 100%, 50%, 0.4)`;

                return polygon;
            });
        }).flat();

        // this.context.render(this.models, this.camera);
        this.context.renderPolygons(polygons, this.camera);

        if(this.debugger())
            debugger;
    }

    public add(model: Model, position?: Point, id?: string): void {
        if(id) {
            model.setId(id);
        }

        if(position) {
            model.setPosition(position);
        }

        this.models.push(model);
        this.context.addModel(model);
        this.dataProvider.addModel(model);
    }

    public remove(model: Model): void {
        this.models = this.models.filter((m) => {
            return m !== model;
        });

        this.context.removeModel(model);
    }

    public run(root: HTMLElement): void {
        const {width, height} = root.getBoundingClientRect();

        while(root.firstChild) {
            root.removeChild(root.firstChild);
        }

        root.append(this.context.domElement);
        this.context.setSizes(width, height)

        if(!this.isLooping) {
            this.isLooping = true;
            this.loop();
        }
    }

    public stop(): void {
        this.isLooping = false;
    }

    protected loop(): void {
        if(!this.isLooping) {
            return;
        }

        window.requestAnimationFrame(() => {
            this.update();

            this.loop();
        });
    }
}


export {Scene};
