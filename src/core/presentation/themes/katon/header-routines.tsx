"use client"

import {Fragment} from "react";
import {useRoutines} from "@/core/infrastructure/routines/routine.hook";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/core/presentation/ui/tooltip";
import {LucideIcon} from "@/core/presentation/icons/lucide";


export function HeaderRoutines() {
    const {getEntries} = useRoutines()
    const routineEntries = [...getEntries()]

    return (
        <Fragment>
            {routineEntries.length ? (
                <div className="flex flex-row gap-1 items-start justify-end pt-3 px-1 ">
                    {
                        routineEntries.map((routine, index) => {
                            return (
                                <Tooltip key={`${routine.id}-${index}`}>
                                    <TooltipTrigger>
                                        <div className={'px-2'}>
                                            <LucideIcon name={routine.icon || 'Cog'} size={6}/>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {routine.name || routine.id}
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })
                    }
                </div>
            ) : undefined}
        </Fragment>
    )
}