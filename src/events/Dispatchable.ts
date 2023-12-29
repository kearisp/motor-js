export type DispatchableEvent = {
    type: string;
};

type ToEventMap<Union extends DispatchableEvent> = {
    [T in Union["type"]]: Extract<Union, {type: T}>;
};

type EventCallback<T extends DispatchableEvent> = (event: T) => void;


export class Dispatchable<T extends DispatchableEvent> {
    protected listeners: {
        [K in keyof ToEventMap<T>]: EventCallback<ToEventMap<T>[K]>[];
    } = {} as any;

    public addEventListener<K extends keyof ToEventMap<T>>(type: K, listener: EventCallback<ToEventMap<T>[K]>): void {
        if(!this.listeners[type]) {
            this.listeners[type] = [];
        }

        this.listeners[type].push(listener);
    }

    public removeEventListener<K extends keyof ToEventMap<T>>(type: K, listener: EventCallback<ToEventMap<T>[K]>): void {
        if(this.listeners[type]) {
            const index = this.listeners[type].indexOf(listener);

            if(index !== -1) {
                this.listeners[type].splice(index, 1);
            }
        }
    }

    public dispatch(event: T): void {
        if(this.listeners[event.type]) {
            this.listeners[event.type].forEach((listener) => listener(event));
        }
    }
}
