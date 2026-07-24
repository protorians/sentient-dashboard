"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { z } from "zod"
import { 
  ShieldCheckIcon, 
  ShieldAlertIcon, 
  EllipsisVerticalIcon,
  UsersIcon
} from "lucide-react"

import { Badge } from "@/core/presentation/ui/badge"
import { Button } from "@/core/presentation/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/presentation/ui/dropdown-menu"

export const accessControlSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  domain: z.string(),
  usersCount: z.number(),
  status: z.string(),
  createdAt: z.string(),
})

export type AccessControlRow = z.infer<typeof accessControlSchema>

export const accessControlColumns: ColumnDef<AccessControlRow>[] = [
  {
    accessorKey: "name",
    header: "Nom du Rôle",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "domain",
    header: "Domaine",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.domain}
      </Badge>
    ),
  },
  {
    accessorKey: "usersCount",
    header: "Utilisateurs",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UsersIcon className="size-4 text-muted-foreground" />
        {row.original.usersCount}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.status === "Active" ? (
          <ShieldCheckIcon className="size-4 text-emerald-500 mr-1" />
        ) : (
          <ShieldAlertIcon className="size-4 text-rose-500 mr-1" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-muted-foreground">
        {row.original.description}
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
            <EllipsisVerticalIcon />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Modifier les permissions</DropdownMenuItem>
          <DropdownMenuItem>Voir les utilisateurs</DropdownMenuItem>
          <DropdownMenuItem>Dupliquer</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
