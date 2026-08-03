import {cn} from "@/core/infrastructure/utilities/utils";
import React from "react";
import {HeaderRoutines} from "@/core/presentation/themes/katon/header-routines";
import {HeaderOptions} from "@/core/presentation/themes/katon/header-options";
import {HeaderOrganizationSelect} from "@/core/presentation/themes/katon/header-organization-select";
import {HeaderMenubar} from "@/core/presentation/themes/katon/header-menubar";

export interface HeaderProps {
    className?: string;
    fixed?: boolean;
}


export function Header({className, fixed = true}: HeaderProps) {
    return (
        <header className={cn(
            "w-full h-24 flex items-start pt-4 gap-2 px-6 md:pl-24",
            fixed ? "relative md:fixed top-0 left-0 z-3 [&+*]:mt-24 backdrop-blur-xl mask-[linear-gradient(to_bottom,background_40%,transparent_100%)]" : "",
            className
        )}>
            <HeaderMenubar/>
            <HeaderOrganizationSelect/>
            <HeaderRoutines/>
            <HeaderOptions/>
        </header>
    )
}