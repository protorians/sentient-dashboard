import {StackableCapabilityInterface, StackableEntityType, StackableMapType} from "./types";

export class StackableCapability<T extends StackableEntityType> implements StackableCapabilityInterface<T> {

    protected _stack: StackableMapType<T> = new Map()

    protected _providing(provider: T): this {
        for (const entry of Object.entries(provider)) {
            this._stack.set(entry[0], entry[1] as T[keyof T]);
        }
        return this;
    }

    get stack(): StackableMapType<T> {
        return this._stack;
    }

    get<K extends keyof T>(key: K): T[K] | undefined {
        return this._stack.get(key) as any;
    }

    set<K extends keyof T>(key: K, value: T[K]): this {
        this._stack.set(key, value);
        return this;
    }

    has<K extends keyof T>(key: K): boolean {
        return this._stack.has(key);
    }

    delete<K extends keyof T>(key: K): this {
        this._stack.delete(key);
        return this;
    }

    clear(): this {
        this._stack.clear();
        return this;
    }

    fromString(data: string): T {
        return this._providing(JSON.parse(data) as T).toObject();
    }

    toObject(): T {
        const stack: T = {} as T;
        for (const [key, value] of this._stack.entries()) stack[key] = value;
        return stack;
    }

    toJson(): string {
        return JSON.stringify(this.toObject());
    }

}