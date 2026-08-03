import {
    RoutineFindOptionsInterface,
    RoutineInstanceInterface,
    RoutineInterface, RoutineInterfaceOptions
} from "@/core/domain/typing/routine.types";
import {RoutineInstanceStatusEnum, RoutineStatusEnum} from "@/core/domain/enums/routine.enum";
import {createDataset, DatasetInstanceType} from "@/core/infrastructure/stores/dataset.store";
import {IconKey} from "@/core/presentation/icons/types";

export class Routine<T extends Object> implements RoutineInterface<T> {
    persist: boolean = false;
    status: RoutineStatusEnum = RoutineStatusEnum.STOP;
    dataset: DatasetInstanceType<T>;
    icon: IconKey | undefined = undefined;
    name: string | undefined = undefined;

    constructor(
        public readonly id: string,
        protected readonly options: RoutineInterfaceOptions = {}
    ) {
        this.dataset = createDataset<T>()
        this.initialize()
    }

    protected initialize(): void {
        this.options.status = typeof this.options.status === 'undefined'
            ? RoutineStatusEnum.PLAY : this.options.status;

        Object.entries(this.options)
            .map(
                ([key, value]) =>
                    this.setOption(key as keyof RoutineInterfaceOptions, value)
            )
    }

    setIcon(icon: IconKey): this {
        this.icon = icon;
        return this;
    }

    job(): Promise<T | undefined> {
        throw new Error(`< ${this.id} > : This job is not implemented`);
    }

    setOption<K extends keyof RoutineInterfaceOptions>(key: K, value: RoutineInterfaceOptions[K]): this {
        this[key as unknown as keyof typeof this] = value as any
        return this;
    }

    getOption<K extends keyof RoutineInterfaceOptions>(key: K): RoutineInterfaceOptions[K] | undefined {
        return (this[key as unknown as keyof typeof this] as RoutineInterfaceOptions[K]) || undefined;
    }

    onPause() {
    }

    onStart() {
    }

    onRemove() {
    }

    onResume() {
    }

    onFail(error: Error) {
    }

    onStop() {
    }

    onJob() {
    }

    onJobEnd() {
    }

    onJobStart() {
    }
}


export class Routines implements RoutineInstanceInterface {
    readonly entries: Set<RoutineInterface<any>>;

    protected _timer: ReturnType<typeof setTimeout> | undefined;

    protected _generation: number = 0;

    status: RoutineInstanceStatusEnum = RoutineInstanceStatusEnum.STOP;

    timeout: number = 5000;

    onChange: (() => void) | undefined;

    constructor() {
        this.entries = new Set<RoutineInterface<any>>();
    }

    protected notify(): this {
        this.onChange?.();
        return this;
    }

    protected syncStatus(): this {
        const routines = [...this.entries.values()];

        if (routines.length === 0) {
            this.status = RoutineInstanceStatusEnum.STOP;
            return this.notify();
        }

        const statuses = new Set(routines.map(routine => routine.status));

        this.status =
            statuses.has(RoutineStatusEnum.PLAY) || statuses.has(RoutineStatusEnum.FAIL)
                ? RoutineInstanceStatusEnum.PLAY
                : statuses.has(RoutineStatusEnum.PAUSE)
                    ? RoutineInstanceStatusEnum.PAUSE
                    : RoutineInstanceStatusEnum.STOP;

        return this.notify();
    }

    find(options: Partial<RoutineFindOptionsInterface>): RoutineInterface<any>[] {
        const search = Object.entries(options)
        return [...this.entries.values()]
            .filter(routine =>
                search.every(
                    ([key, value]) =>
                        routine[key as keyof RoutineInterface<any>] == value
                )
            );
    }

    clear(force?: boolean): this {
        [...this.entries.values()]
            .forEach(routine => {
                if (force || (!force && !routine.persist))
                    this.remove(routine.id)
            })
        return this.syncStatus();
    }

    enqueue<T extends Object>(routine: RoutineInterface<T>): this {
        if (!this.exists(routine.id)) this.entries.add(routine);
        return this.syncStatus();
    }

    exists<T extends Object>(id: string): RoutineInterface<T> | undefined {
        return [...this.entries.values()].find(
            routine => routine.id === id,
        )
    }

    pause(id?: string): this {
        (id ? this.find({id}) : [...this.entries.values()])
            .forEach((routine) => {
                if (routine.status === RoutineStatusEnum.PLAY) {
                    routine.status = RoutineStatusEnum.PAUSE;
                    routine.onPause?.();
                }
            })
        return this.syncStatus();
    }

    remove(id: string): this {
        this.find({id}).map(routine => {
            this.entries.delete(routine);
            routine.onRemove?.();
        });
        return this.syncStatus();
    }

    resume(id?: string): this {
        (id ? this.find({id}) : [...this.entries.values()])
            .forEach((routine) => {
                if (routine.status === RoutineStatusEnum.PAUSE) {
                    routine.status = RoutineStatusEnum.PLAY;
                    routine.onResume?.();
                }
            })
        return this.syncStatus();
    }

    async run(id?: string): Promise<this> {
        await this.executes(id)
        this.start();
        return this.work()
    }

    start(id?: string): this {
        (id ? this.find({id}) : [...this.entries.values()])
            .forEach((routine) => {
                routine.status = RoutineStatusEnum.PLAY;
                routine.onStart?.();
            })
        return this.syncStatus();
    }

    stop(id?: string): this {
        this._generation++;
        (id ? this.find({id}) : [...this.entries.values()])
            .forEach((routine) => {
                routine.status = RoutineStatusEnum.STOP;
                routine.onStop?.();
            })
        if (this._timer) {
            clearTimeout(this._timer)
            this._timer = undefined;
        }
        return this.syncStatus();
    }

    protected async executes(id?: string): Promise<this> {
        const routines = id ? this.find({id}) : [...this.entries.values()];

        await Promise.all(routines.map(async (routine) => {
            if (
                routine.status === RoutineStatusEnum.PLAY ||
                routine.status === RoutineStatusEnum.FAIL
            ) {
                try {
                    routine.setOption('status', RoutineStatusEnum.PLAY);
                    routine.onJobStart?.();
                    routine.dataset.getState().setMany(await routine.job());
                    routine.onJob?.();
                } catch (err: any) {
                    routine.setOption('status', RoutineStatusEnum.FAIL);
                    routine.onFail?.(err instanceof Error ? err : new Error(err?.toString() || 'Erreur inconnue'));
                }
                routine.onJobEnd?.();
            }
        }));
        return this;
    }

    work(id?: string): this {
        const generation = ++this._generation;

        const tick = async () => {
            if (generation !== this._generation) return;

            if (this.status === RoutineInstanceStatusEnum.STOP) {
                this._timer = undefined;
                return;
            }

            if (this.status === RoutineInstanceStatusEnum.PLAY) {
                await this.executes(id);
                this.syncStatus();
            }

            if (generation !== this._generation) return;
            this._timer = setTimeout(tick, this.timeout || 1000);
        }

        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(tick, this.timeout || 1000);
        return this;
    }

}