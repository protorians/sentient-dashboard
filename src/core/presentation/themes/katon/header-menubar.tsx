"use client"

import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {ModuleMenubar} from "@/core/presentation/module-menubar";
import {Fragment} from "react";
import {cn} from "@/core/infrastructure/utilities/utils";

export type HeaderMenubarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const sizeClasses: Record<HeaderMenubarSize, { name: string; wrapper: string }> = {
    xs: {name: "text-sm pt-1", wrapper: "pt-0.5"},
    sm: {name: "text-sm pt-1.5", wrapper: "pt-0.5"},
    md: {name: "text-base pt-2", wrapper: "pt-1"},
    lg: {name: "text-lg pt-2.5", wrapper: "pt-1.5"},
    xl: {name: "text-xl pt-3", wrapper: "pt-2"},
    xxl: {name: "text-2xl pt-3.5", wrapper: "pt-2.5"},
};

export interface HeaderMenubarProps {
    size?: HeaderMenubarSize;
}

export function HeaderMenubar({size = 'md'}: HeaderMenubarProps) {
    const {selectedModule} = useModuleStore();
    const classes = sizeClasses[size];

    return (
        <Fragment>
            {selectedModule?.name && (
                <div className={cn("text-primary", classes.name)}>
                    {selectedModule?.name}
                </div>
            )}
            <div className={cn("flex-auto flex flex-row items-start justify-start", classes.wrapper)}>
                {selectedModule ? <ModuleMenubar module={selectedModule} size={size}/> : null}
            </div>
        </Fragment>
    )
}
