"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {
    ShieldCheckIcon,
    ShieldAlertIcon,
    EllipsisVerticalIcon,
    UsersIcon
} from "lucide-react"

import {Badge} from "@/core/presentation/ui/badge"
import {Button} from "@/core/presentation/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/core/presentation/ui/dropdown-menu"
import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {getFullName} from "@/modules/users/infrastructure/utilities/users-name.util";
import {UserStatusEnum} from "@/modules/auth/domain/enums/user-status.enum";

export const usersDataGridColumns: ColumnDef<UserInterface>[] = [
    {
        accessorKey: "Nom d'utilisateur",
        header: "Nom d'utilisateur",
        cell: ({row}) => (
            <div className="font-medium">{row.original.username}</div>
        ),
    },
    {
        accessorKey: "Rôles",
        header: "Roles",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.roles?.map(role => role.name).join(", ")}
            </Badge>
        ),
    },
    {
        accessorKey: "Nom complet",
        header: "Nom complet",
        cell: ({row}) => (
            <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-muted-foreground"/>
                {getFullName(row.original)}
            </div>
        ),
    },
    {
        accessorKey: "Statut",
        header: "Statut",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.status === UserStatusEnum.ACTIVE ? (
                    <ShieldCheckIcon className="size-4 text-emerald-500 mr-1"/>
                ) : row.original.status === UserStatusEnum.INACTIVE ? (
                    <ShieldAlertIcon className="size-4 text-rose-500 mr-1"/>
                ) : row.original.status === UserStatusEnum.BANNED ? (
                    <ShieldAlertIcon className="size-4 text-rose-500 mr-1"/>
                ) : row.original.status === UserStatusEnum.SUSPENDED ? (
                    <ShieldAlertIcon className="size-4 text-rose-500 mr-1"/>
                ) : row.original.status}
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({row}) => (
            <div className="max-w-75 truncate text-muted-foreground">
                {row.original.email}
            </div>
        ),
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                        size="icon"
                    >
                        <EllipsisVerticalIcon/>
                        <span className="sr-only">Ouvrir le menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>Modifier</DropdownMenuItem>
                    <DropdownMenuItem>Afficher les détails</DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem variant="destructive">Blocker</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">Supprimer</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]
