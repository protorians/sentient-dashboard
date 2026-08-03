import {DatasetInstanceType} from "@/core/infrastructure/stores/dataset.store";
import {RoutineInstanceStatusEnum, RoutineStatusEnum} from "@/core/domain/enums/routine.enum";
import {IconKey} from "@/core/presentation/icons/types";

export interface RoutineFindOptionsInterface {
    id: string;
    status: RoutineStatusEnum;
    persist: boolean;
}

export interface RoutineProps<T extends Object> extends Omit<RoutineInterface<T>, 'dataset' | 'status'> {
    id: string;
}

export interface RoutineInterfaceOptions {
    status?: RoutineStatusEnum;
    persist?: boolean;
    icon?: IconKey;
    name?: string;
}

export interface RoutineLifeCircle {
    onJob?(): void;

    onStart?(): void;

    onPause?(): void;

    onStop?(): void;

    onResume?(): void;

    onJobEnd?(): void;

    onJobStart?(): void;

    onRemove?(): void;

    onFail?(error: Error): void;
}

export interface RoutineUiInterface {
    icon?: IconKey;
    name: string | undefined;
    setIcon(icon: IconKey): this;
}

export interface RoutineInterface<T extends Object> extends RoutineLifeCircle, RoutineUiInterface {
    readonly id: string;

    readonly dataset: DatasetInstanceType<T>;

    status: RoutineStatusEnum;

    persist: boolean;

    setOption<K extends keyof RoutineInterfaceOptions>(key: K, value: RoutineInterfaceOptions[K]): this;

    getOption<K extends keyof RoutineInterfaceOptions>(key: K): RoutineInterfaceOptions[K] | undefined;

    job(): Promise<T | undefined>;
}

export interface RoutineInstanceInterface {
    readonly entries: Set<RoutineInterface<any>>;

    status: RoutineInstanceStatusEnum;

    timeout: number;

    find(options: Partial<RoutineFindOptionsInterface>): RoutineInterface<any>[]

    enqueue<T extends Object>(routine: RoutineInterface<T>): this;

    exists<T extends Object>(id: string): RoutineInterface<T> | undefined;

    run(id?: string): Promise<this>;

    remove(id: string): this;

    clear(force?: boolean): this;

    work(id?: string): this;

    start(id?: string): this;

    pause(id?: string): this;

    stop(id?: string): this;

    resume(id?: string): this;

}