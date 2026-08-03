"use client"

import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {ModuleMenubar} from "@/core/presentation/module-menubar";
import {Fragment} from "react";

export function HeaderMenubar() {
    const {selectedModule} = useModuleStore()

    return (
        <Fragment>
            {selectedModule?.name && (
                <div className="text-base text-primary pt-2">
                    {selectedModule?.name}
                </div>
            )}
            <div className="flex-auto flex flex-row items-start justify-start pt-1">
                {selectedModule ? <ModuleMenubar module={selectedModule}/> : null}
            </div>
        </Fragment>
    )
}