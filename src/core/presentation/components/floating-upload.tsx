"use client"

import * as React from "react"
import { useRef, useState } from "react"
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CloudUpload,
    FileText,
    Loader2,
    RotateCw,
    Trash2,
    Upload,
    X,
    XCircle,
} from "lucide-react"
import { Button } from "@/core/presentation/ui/button"
import { Progress } from "@/core/presentation/ui/progress"
import { Badge } from "@/core/presentation/ui/badge"
import { useUploadStore, type UploadItem } from "@/core/infrastructure/stores/upload.store"
import { cn } from "@/core/infrastructure/utilities/utils"
import { formatBytesPerSecond, formatEta, formatFileSize } from "@/core/infrastructure/utilities/format.util"
import type { MediaUploadOptions } from "@/core/domain/entities/media"

function UploadRow({ upload }: { upload: UploadItem }) {
    const removeFile = useUploadStore((state) => state.removeFile)
    const retryFile = useUploadStore((state) => state.retryFile)
    const isUploading = upload.status === "uploading" || upload.status === "idle"
    const isLoading = upload.status === "uploading"

    return (
        <div
            data-slot="upload-row"
            data-status={upload.status}
            className="flex flex-col gap-1.5 rounded-lg border border-border/60 bg-muted/30 p-2.5"
        >
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-foreground/10">
                    {upload.status === "done" ? (
                        <CheckCircle2 className="size-4 text-emerald-500"/>
                    ) : upload.status === "error" ? (
                        <XCircle className="size-4 text-destructive"/>
                    ) : upload.status === "cancelled" ? (
                        <X className="size-4 text-muted-foreground"/>
                    ) : (
                        <FileText className="size-4 text-muted-foreground"/>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium" title={upload.name}>
                        {upload.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatFileSize(upload.size)}
                        {isLoading && upload.speed > 0 && (
                            <> · {formatBytesPerSecond(upload.speed)}</>
                        )}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {isUploading && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeFile(upload.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Annuler le téléversement"
                        >
                            <X className="size-4"/>
                        </Button>
                    )}
                    {upload.status === "error" && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => retryFile(upload.id)}
                            aria-label="Réessayer"
                        >
                            <RotateCw className="size-4"/>
                        </Button>
                    )}
                    {(upload.status === "done" || upload.status === "error" || upload.status === "cancelled") && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeFile(upload.id)}
                            aria-label="Retirer le fichier"
                        >
                            <Trash2 className="size-4"/>
                        </Button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2">
                    <Progress value={upload.progress} className="h-1.5 flex-1"/>
                    <span className="w-11 text-right text-xs tabular-nums text-muted-foreground">
                        {Math.round(upload.progress)}%
                    </span>
                </div>
            ) : upload.status === "error" ? (
                <span className="text-xs text-destructive line-clamp-1">{upload.error}</span>
            ) : upload.status === "cancelled" ? (
                <span className="text-xs text-muted-foreground">Téléversement annulé</span>
            ) : upload.status === "done" ? (
                <span className="text-xs text-emerald-500">Terminé</span>
            ) : null}

            {isLoading && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin"/>
                        {upload.eta ? formatEta(upload.eta) : "Estimation…"}
                    </span>
                    <span>{formatFileSize(upload.size - (upload.size * upload.progress) / 100)} restants</span>
                </div>
            )}
        </div>
    )
}

function UploadPanel({ uploadOptions }: { uploadOptions?: MediaUploadOptions }) {
    const uploads = useUploadStore((state) => state.uploads)
    const collapse = useUploadStore((state) => state.collapse)
    const addFiles = useUploadStore((state) => state.addFiles)
    const clearCompleted = useUploadStore((state) => state.clearCompleted)
    const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads)
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const overall = uploads.length
        ? uploads.reduce((acc, u) => acc + u.progress, 0) / uploads.length
        : 0

    const handleFiles = (fileList: FileList | File[] | null) => {
        if (!fileList) return
        addFiles(Array.from(fileList), uploadOptions)
    }

    const hasCompleted = uploads.some(
        (u) => u.status === "done" || u.status === "error" || u.status === "cancelled"
    )

    return (
        <div
            data-slot="upload-panel"
            className="flex w-80 flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10"
            onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                handleFiles(e.dataTransfer.files)
            }}
        >
            <div className="flex items-center gap-2 border-b px-3 py-2.5">
                <CloudUpload className="size-4 text-primary"/>
                <span className="flex-1 text-sm font-medium">Téléversements</span>
                {hasActiveUploads && (
                    <Badge variant="secondary" className="gap-1">
                        <Loader2 className="size-3 animate-spin"/>
                        En cours
                    </Badge>
                )}
                <Button variant="ghost" size="icon-sm" onClick={collapse} aria-label="Réduire">
                    <ChevronDown className="size-4"/>
                </Button>
            </div>

            {hasActiveUploads && (
                <div className="border-b px-3 py-2">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progression globale</span>
                        <span className="tabular-nums">{Math.round(overall)}%</span>
                    </div>
                    <Progress value={overall} className="h-1.5"/>
                </div>
            )}

            <div
                className={cn(
                    "flex max-h-80 min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5",
                    isDragOver && "bg-primary/5"
                )}
            >
                {uploads.length === 0 ? (
                    <div
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground",
                            isDragOver && "border-primary text-primary"
                        )}
                    >
                        <Upload className="size-6"/>
                        <span>Glissez-déposez des fichiers ici</span>
                        <span>ou</span>
                        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                            Sélectionner des fichiers
                        </Button>
                    </div>
                ) : (
                    <>
                        {uploads.map((upload) => (
                            <UploadRow key={upload.id} upload={upload}/>
                        ))}
                        {isDragOver && (
                            <div className="pointer-events-none flex items-center justify-center rounded-lg border-2 border-dashed border-primary p-3 text-xs text-primary">
                                Déposez pour téléverser
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 border-t px-3 py-2">
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        handleFiles(e.target.files)
                        e.target.value = ""
                    }}
                />
                <Button variant="outline" size="sm" className="flex-1" onClick={() => inputRef.current?.click()}>
                    <Upload className="size-3.5"/>
                    Ajouter
                </Button>
                {hasCompleted && (
                    <Button variant="ghost" size="sm" onClick={clearCompleted}>
                        Vider
                    </Button>
                )}
            </div>
        </div>
    )
}

export function FloatingUpload({ module, type }: { module?: string; type?: string }) {
    const isExpanded = useUploadStore((state) => state.isExpanded)
    const toggle = useUploadStore((state) => state.toggle)
    const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads)
    const uploads = useUploadStore((state) => state.uploads)

    React.useEffect(() => {
        if (!hasActiveUploads) return
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = ""
        }
        window.addEventListener("beforeunload", handler)
        return () => window.removeEventListener("beforeunload", handler)
    }, [hasActiveUploads])

    if (!hasActiveUploads) return null;

    const activeCount = uploads.filter(
        (u) => u.status === "uploading" || u.status === "idle"
    ).length

    const uploadOptions: MediaUploadOptions | undefined = module
        ? { module, type }
        : undefined

    return (
        <div className="fixed right-4 bottom-4 z-500 flex flex-col items-end gap-2">
            {isExpanded && <UploadPanel uploadOptions={uploadOptions}/>}

            <Button
                onClick={toggle}
                size="icon-lg"
                className="relative size-12 rounded-full shadow-lg"
                aria-label={isExpanded ? "Réduire les téléversements" : "Ouvrir les téléversements"}
            >
                {isExpanded ? <ChevronUp className="size-5"/> : <Upload className="size-5"/>}
                {!isExpanded && hasActiveUploads && activeCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
                        {activeCount}
                    </span>
                )}
            </Button>
        </div>
    )
}
