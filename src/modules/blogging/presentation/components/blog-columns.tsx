"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {FileTextIcon, GlobeIcon, PencilIcon} from "lucide-react"

import {Badge} from "@/core/presentation/ui/badge";
import {PostVm} from "@/modules/blogging/domain/blogging.interface";
import {getDataGridAction} from "@/core/presentation/data-grid/data-grid";
import {Clickable} from "@/core/presentation/clickable";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/core/presentation/ui/tooltip";

export const getBlogColumns = (): ColumnDef<PostVm>[] => [
    {
        accessorKey: "title",
        header: "Titre",
        cell: ({row, table}) => {
            const details = getDataGridAction(table, row.original, "details")
            return (
                <Clickable onClick={() => details?.onExecute(row.original)}>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{row.original.title}</span>
                        {row.original.slug && (
                            <span className="text-xs text-muted-foreground truncate font-mono">
                                /{row.original.slug}
                            </span>
                        )}
                    </div>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "categories",
        header: "Catégories",
        cell: ({row}) => (
            <div className="flex flex-wrap gap-1">
                {row.original.categories && row.original.categories.length > 0
                    ? row.original.categories.map((cat) => (
                        <Badge key={cat.id} variant="outline" className="px-1.5 text-muted-foreground text-xs">
                            {cat.title}
                        </Badge>
                    ))
                    : <span className="text-muted-foreground text-xs">—</span>
                }
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => {
            const isPublished = row.original.publishedAt || row.original.status === 'published'
            return (
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {isPublished ? (
                        <GlobeIcon className="size-4 text-emerald-500 mr-1"/>
                    ) : (
                        <PencilIcon className="size-4 text-amber-500 mr-1"/>
                    )}
                    {isPublished ? 'Publié' : 'Brouillon'}
                </Badge>
            )
        },
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({row}) => (
            <div className="flex flex-wrap gap-1 max-w-50">
                {row.original.tags && row.original.tags.length > 0
                    ? row.original.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary"
                               className="px-1.5 text-xs truncate max-w-24">
                            {tag.label}
                        </Badge>
                    ))
                    : <span className="text-muted-foreground text-xs">—</span>
                }
            </div>
        ),
    },
    {
        accessorKey: "author",
        header: "Auteur",
        cell: ({row}) => (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <FileTextIcon className="size-3.5"/>
                        <span className="truncate max-w-30">
                            {row.original.author?.fullName
                                || row.original.author?.username
                                || row.original.author?.email
                                || "—"}
                        </span>
                    </div>
                </TooltipTrigger>
                {row.original.author && (
                    <TooltipContent>
                        <p>{row.original.author.fullName || row.original.author.username}</p>
                        {row.original.author.email && (
                            <p className="text-xs text-muted-foreground">{row.original.author.email}</p>
                        )}
                    </TooltipContent>
                )}
            </Tooltip>
        ),
    },
    {
        accessorKey: "publishedAt",
        header: "Publié le",
        cell: ({row}) => (
            <div className="text-muted-foreground text-sm">
                {row.original.publishedAt
                    ? new Date(row.original.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })
                    : "—"}
            </div>
        ),
    },
];
