
export type StackableValueType = string | number | boolean | object | null | undefined;

export type StackableEntityType = Record<string, StackableValueType>;

export type StackableMapType<T extends StackableEntityType> = Map<keyof T, T[keyof T]>;

export interface StackableCapabilityInterface<T extends StackableEntityType> {
    get stack(): StackableMapType<T>;

    get<K extends keyof T>(key: K): T[K] | undefined;

    set<K extends keyof T>(key: K, value: T[K]): this;

    has<K extends keyof T>(key: K): boolean;

    delete<K extends keyof T>(key: K): this;

    clear(): this;

    toObject(): T;

    toJson(): string;
}