import {SVGContext} from "../context/SVGContext";
import {CanvasContext} from "../context/CanvasContext";
import {Camera} from "./Camera";
import {Context} from "./Context";
import {DataProvider} from "./DataProvider";
import {Model} from "./Model";
import {Point} from "../types/Point";


class Scene {
    protected camera: Camera;
    protected context: Context;
    protected dataProvider: DataProvider;
    protected isLooping = false;

    public constructor(context: "svg" | "canvas" | Context) {
        switch(context) {
            case "svg":
                this.context = new SVGContext();
                break;

            case "canvas":
                this.context = new CanvasContext();
                break;

            default:
                this.context = context;
                break;
        }

        this.dataProvider = new DataProvider();
        this.camera = new Camera(this.context, this.dataProvider);
    }

    public getContext() {
        return this.context;
    }

    public getCamera() {
        return this.camera;
    }

    public async requestPointerLock() {
        return this.context.requestPointerLock();
    }

    public update() {
        for(const model of this.dataProvider.getModels()) {
            //
        }
    }

    public add(model: Model, position?: Point, id?: string) {
        if(id) {
            model.setId(id);
        }

        if(position) {
            model.setPosition(position);
        }

        this.dataProvider.addModel(model);
    }

    public run(root: HTMLElement) {
        const {width, height} = root.getBoundingClientRect();

        this.context.setWidth(width);
        this.context.setHeight(height);

        while(root.firstChild) {
            root.removeChild(root.firstChild);
        }

        this.context.render(root);

        this.camera.run();
    }

    public stop() {
        this.camera.destroy();
    }

    protected loop() {
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
