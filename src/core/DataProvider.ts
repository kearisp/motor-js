import {Model} from "./Model";


class DataProvider {
    protected models: Model[] = [];

    public getModels() {
        return this.models;
    }

    public addModel(model: Model) {
        this.models.push(model);
    }
}


export {DataProvider};
