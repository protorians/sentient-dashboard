import type {
    RoutineFindOptionsInterface,
    RoutineInterface,
    RoutineInterfaceOptions,
    RoutineProps
} from "@/core/domain/typing/routine.types";
import {Routine, Routines} from "@/core/infrastructure/routines/routine";
import {RoutineInstanceStatusEnum, RoutineStatusEnum} from "@/core/domain/enums/routine.enum";
import {IconKey} from "@/core/presentation/icons/types";
import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";

const instance = new Routines();

export const routines = instance;

interface RoutinesState {
    entries: RoutineInterface<any>[];
    status: RoutineInstanceStatusEnum;
    getEntries: () => RoutineInterface<any>[];
    find: (options: Partial<RoutineFindOptionsInterface>) => RoutineInterface<any>[];
    exists: (id: string) => RoutineInterface<any> | undefined;
    enqueue: <T extends Object>(routine: RoutineInterface<T>) => Routines;
    clear: (force?: boolean) => Routines;
    pause: (id?: string) => Routines;
    remove: (id: string) => Routines;
    resume: (id?: string) => Routines;
    run: (id?: string) => Promise<Routines>;
    start: (id?: string) => Routines;
    stop: (id?: string) => Routines;
    work: (id?: string) => Routines;
    sync: () => void;
}

export const useRoutinesStore = create<RoutinesState>((set, get) => {
    const sync = () => set({
        entries: [...instance.entries],
        status: instance.status,
    });

    instance.onChange = sync;

    return {
        entries: [],
        status: RoutineInstanceStatusEnum.STOP,
        getEntries: () => get().entries,
        find: (options) => instance.find(options),
        exists: (id) => instance.exists(id),
        enqueue: (routine) => instance.enqueue(routine),
        clear: (force) => instance.clear(force),
        pause: (id) => instance.pause(id),
        remove: (id) => instance.remove(id),
        resume: (id) => instance.resume(id),
        run: (id) => instance.run(id),
        start: (id) => instance.start(id),
        stop: (id) => instance.stop(id),
        work: (id) => instance.work(id),
        sync,
    };
});

export function useRoutines() {
    return useRoutinesStore(useShallow((state) => ({
        entries: state.entries,
        status: state.status,
        getEntries: state.getEntries,
        find: state.find,
        exists: state.exists,
        enqueue: state.enqueue,
        clear: state.clear,
        pause: state.pause,
        remove: state.remove,
        resume: state.resume,
        run: state.run,
        start: state.start,
        stop: state.stop,
        work: state.work,
    })));
}

export function createRoutine<T extends Object>(props: RoutineProps<T>, options?: RoutineInterfaceOptions) {
    const routine = new Routine<T>(props.id, options);
    instance.enqueue(routine);
    const sync = () => useRoutinesStore.getState().sync();
    return {
        isPersist: () => routine.persist,
        setPersist: (value: boolean) => {
            routine.setOption('persist', value);
            sync();
        },
        getStatus: () => routine.status,
        getIcon: () => routine.icon,
        setIcon: (icon: IconKey) => routine.setIcon(icon),
        job: () => routine.job(),
        play: () => {
            routine.setOption('status', RoutineStatusEnum.PLAY);
            sync();
        },
        pause: () => {
            routine.setOption('status', RoutineStatusEnum.PAUSE);
            sync();
        },
        stop: () => {
            routine.setOption('status', RoutineStatusEnum.STOP);
            sync();
        },
        fail: () => {
            routine.setOption('status', RoutineStatusEnum.FAIL);
            sync();
        },
        onJob: routine.onJob?.bind(routine),
        onJobStart: routine.onJobStart?.bind(routine),
        onJobEnd: routine.onJobEnd?.bind(routine),
        onPause: routine.onPause?.bind(routine),
        onStart: routine.onStart?.bind(routine),
        onResume: routine.onResume?.bind(routine),
        onStop: routine.onStop?.bind(routine),
        onFail: routine.onFail?.bind(routine),
        onRemove: routine.onRemove?.bind(routine),
    }
}
