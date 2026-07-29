"use client"

import {cn} from "@/core/infrastructure/utilities/utils";
import {ThemeLogo} from "@/core/presentation/system/logo.theme";
import Link from "next/link";
import {BellDot, Building2Icon, HomeIcon, UsersIcon} from "lucide-react";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import React, {useEffect} from "react";
import {NavUser} from "@/core/presentation/nav-user";
import {HeaderTasksConnectedUser} from "@/core/presentation/themes/katon/header-tasks-connected-user";
import {defaultModulesNavConfig} from "@/core/domain/config/modules.config";
import {ModuleNavigationInterface} from "@/core/domain/entities/module.interface";
import {LucideIcon} from "@/core/presentation/icons/lucide";
import {StartMenu} from "@/core/presentation/themes/katon/start-menu";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {Avatar, AvatarFallback, AvatarImage} from "@/core/presentation/ui/avatar";
import {CommonClassName} from "@/core/infrastructure/utilities/classname.util";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/core/presentation/ui/tooltip";
import {EdgeSection} from "@/core/presentation/themes/katon/edge-section";
import {ThemeSwitcherButton} from "@/core/presentation/ThemeSwitcherButton";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {ModuleMenubar} from "@/core/presentation/module-menubar";

export interface HeaderProps {
    className?: string;
    fixed?: boolean;
}


export function Header({className, fixed = true}: HeaderProps) {
    const {selectedModule} = useModuleStore()
    const organization = AuthUserService.getCurrentOrganization();

    return (
        <header className={cn(
            "w-full h-24 flex items-start pt-4 gap-4 px-6 md:pl-24",
            fixed ? "relative md:fixed top-0 left-0 z-10 [&+*]:mt-24 backdrop-blur-xl mask-[linear-gradient(to_bottom,background_40%,transparent_100%)]" : "",
            className
        )}>

            {selectedModule?.name && (<div className="text-base text-primary">
                {selectedModule?.name}
            </div>)}

            <div className="flex-auto flex flex-row items-center justify-start">
                {selectedModule ? <ModuleMenubar module={selectedModule}/> : null}
            </div>
            {
                organization && (
                    <Tooltip>
                        <TooltipTrigger>
                            <EdgeSection className="gap-2 px-4 py-3 text-foreground">
                                <span className={" text-sm leading-3"}>{organization.name}</span>
                                <Building2Icon size={16} />
                            </EdgeSection>
                        </TooltipTrigger>
                        <TooltipContent side={'left'}>
                            {organization.description || 'Aucune description de l\'organisation'}
                        </TooltipContent>
                    </Tooltip>
                )
            }

            <div className="flex flex-row items-center justify-center px-4 gap-2">
                <Link href={'/notifications'}>
                    <BellDot/>
                </Link>
                <ThemeSwitcherButton/>
                <HeaderTasksConnectedUser/>
            </div>

        </header>
    )
}