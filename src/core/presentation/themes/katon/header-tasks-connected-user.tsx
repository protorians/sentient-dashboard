"use client"

import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/core/presentation/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/core/presentation/ui/avatar";
import {
    BellIcon,
    CircleUserRoundIcon,
    CogIcon,
    CreditCardIcon,
    EllipsisVerticalIcon,
    LogOutIcon, MoonIcon, ShieldCogIcon,
    SunIcon
} from "lucide-react";
import React from "react";
import {Button} from "../../ui/button";
import {useThemePreferColorSchemeStore} from "@/core/infrastructure/stores/theme.store";
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum";
import Link from "next/link";

export function HeaderTasksConnectedUser() {
    const {colorScheme, toggleColorScheme} = useThemePreferColorSchemeStore()
    const {user: authUser} = useAuth();
    const user = React.useMemo(() => ({
        name: authUser?.username || authUser?.userData?.firstname || "Utilisateur",
        email: authUser?.email || "No email",
        avatar: "/avatars/shadcn.jpg", // Fallback avatar
    }), [authUser]);
    const {logout} = useAuth()


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    className="flex flex-row items-center p-2 rounded-md data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                        <AvatarImage src={user.avatar} alt={user.name}/>
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    {/*<div className="grid flex-1 text-left text-sm leading-tight">*/}
                    {/*    <span className="truncate font-medium">{user.name}</span>*/}
                    {/*    <span className="truncate text-xs text-muted-foreground">{user.email}</span>*/}
                    {/*</div>*/}
                    <EllipsisVerticalIcon className="ml-auto size-4"/>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={"bottom"}
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.avatar} alt={user.name}/>
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/account" className="flex w-full items-center">
                            <CircleUserRoundIcon className="mr-2 h-4 w-4"/>
                            <span>Mon compte</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/account/security" className="flex w-full items-center">
                            <ShieldCogIcon/>
                            Mot de passe
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/account/notifications" className="flex w-full items-center">
                            <BellIcon/>
                            Notifications
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    onClick={() => toggleColorScheme(true)}>
                    {
                        (colorScheme !== PreferColorSchemeEnum.Light)
                            ? <><SunIcon/> <span>Thème clair</span></>
                            : <><MoonIcon/> <span>Thème sombre</span></>
                    }
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOutIcon/>
                    Se déconnecter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}