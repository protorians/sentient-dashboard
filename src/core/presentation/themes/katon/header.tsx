"use client"

import {cn} from "@/core/infrastructure/utilities/utils";
import {ThemeLogo} from "@/core/presentation/system/logo.theme";
import Link from "next/link";
import {BellDot, Building2Icon, HomeIcon, UsersIcon} from "lucide-react";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import React from "react";
import {NavUser} from "@/core/presentation/nav-user";
import {HeaderTasksConnectedUser} from "@/core/presentation/themes/katon/header-tasks-connected-user";
import {defaultModulesNavConfig} from "@/core/domain/config/modules.config";
import {ModuleNavigationInterface} from "@/core/domain/entities/module.interface";
import {LucideIcon} from "@/core/presentation/icons/lucide";
import {HeaderNavigation} from "@/core/presentation/themes/katon/header-navigation";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {Avatar, AvatarFallback, AvatarImage} from "@/core/presentation/ui/avatar";
import {CommonClassName} from "@/core/infrastructure/utilities/classname.util";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/core/presentation/ui/tooltip";
import {EdgeSection} from "@/core/presentation/themes/katon/edge-section";
import {ThemeSwitcherButton} from "@/core/presentation/ThemeSwitcherButton";

export interface HeaderProps {
    className?: string;
    fixed?: boolean;
}


export function Header({className, fixed = true}: HeaderProps) {
    // const { user: authUser } = useAuth();
    // const user = React.useMemo(() => ({
    //   name: authUser?.username || authUser?.userData?.firstname || "Utilisateur",
    //   email: authUser?.email || "No email",
    //   avatar: "/avatars/shadcn.jpg", // Fallback avatar
    // }), [authUser]);

    const organization = AuthUserService.getCurrentOrganization();

    return (
        <header className={cn(
            "w-full h-16 flex items-center gap-4",
            fixed ? "fixed top-0 left-0 z-10 [&+*]:mt-16 bg-linear-0 to-background/90" : "",
            className
        )}>

            <div className="flex-auto flex flex-row items-center justify-start">

            </div>

            {
                organization && (
                    <Tooltip>
                        <TooltipTrigger>
                            <EdgeSection className="gap-2 px-4 py-3">
                                <span className={"text-foreground text-sm leading-3"}>{organization.name}</span>
                                <Building2Icon size={16} strokeWidth={1}/>
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