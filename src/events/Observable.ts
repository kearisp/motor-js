type EventCallback<T> = (event: T) => void;


export class Observable<T> {
    protected listeners: {
        [K in keyof T]: EventCallback<T[K]>[];
    } = {} as any;

    public addEventListener<K extends keyof T>(type: K, listener: EventCallback<T[K]>): void {
        if(!this.listeners[type]) {
            this.listeners[type] = [];
        }

        this.listeners[type].push(listener);
    }

    public removeEventListener<K extends keyof T>(type: K, listener: EventCallback<T[K]>): void {
        if(this.listeners[type]) {
            const index = this.listeners[type].indexOf(listener);

            if(index !== -1) {
                this.listeners[type].splice(index, 1);
            }
        }
    }

    public emit<K extends keyof T>(type: K, event: T[K]): void {
        if(this.listeners[type]) {
            this.listeners[type].forEach((listener) => listener(event));
        }
    }
}