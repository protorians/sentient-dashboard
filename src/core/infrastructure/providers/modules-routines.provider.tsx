"use client"

import {useEffect} from "react";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {RoutineInterface} from "@/core/domain/typing/routine.types";
import {useRoutines} from "@/core/infrastructure/routines/routine.hook";
import {toast} from "sonner";

export function ModulesRoutinesProvider() {
    const {enqueue, clear, run} = useRoutines()
    const selectedModule = useModuleStore((state) => state.selectedModule);

    useEffect(() => {
        clear(false);

        if (!selectedModule?.routines) return;

        selectedModule.routines.forEach(
            (routine: RoutineInterface<any>) =>
                enqueue(routine).start(routine.id)
        );

        run()
            .then((routines) => {

            })
            .catch(err => {
                toast.error(err.message || err.toString())
            })
    }, [selectedModule]);

    return null;
}
