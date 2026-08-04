"use client"

import * as React from "react"
import { CheckCircle2, CloudUpload, Loader2, XCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/core/presentation/ui/dialog"
import { Button } from "@/core/presentation/ui/button"
import { Progress } from "@/core/presentation/ui/progress"
import { useUploadStore, type UploadItem } from "@/core/infrastructure/stores/upload.store"
import { formatEta, formatFileSize } from "@/core/infrastructure/utilities/format.util"

interface UploadProgressDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAllComplete?: () => void
}

function UploadProgressRow({ upload }: { upload: UploadItem }) {
    const isUploading = upload.status === "uploading"
    const isDone = upload.status === "done"

    return (
        <div className="flex flex-col gap-1.5 rounded-lg border border-border/60 bg-muted/30 p-2.5">
            <div className="flex items-center gap-2 min-w-0">
                {isDone ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500"/>
                ) : upload.status === "error" ? (
                    <XCircle className="size-4 shrink-0 text-destructive"/>
                ) : (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground"/>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{upload.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatFileSize(upload.size)}
                </span>
            </div>
            {isUploading && (
                <div className="flex items-center gap-2">
                    <Progress value={upload.progress} className="h-1.5 flex-1"/>
                    <span className="w-11 text-right text-xs tabular-nums text-muted-foreground">
                        {Math.round(upload.progress)}%
                    </span>
                </div>
            )}
            {isUploading && (
                <span className="text-xs text-muted-foreground">
                    {upload.eta ? formatEta(upload.eta) : "Estimation du temps restant…"}
                </span>
            )}
            {upload.status === "error" && (
                <span className="text-xs text-destructive line-clamp-1">{upload.error}</span>
            )}
        </div>
    )
}

export function UploadProgressDialog({ open, onOpenChange, onAllComplete }: UploadProgressDialogProps) {
    const uploads = useUploadStore((state) => state.uploads)
    const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads)
    const didAutoComplete = React.useRef(false)

    const activeUploads = uploads.filter((u) => u.status === "uploading" || u.status === "idle")
    const failedCount = uploads.filter((u) => u.status === "error").length

    React.useEffect(() => {
        if (!open) {
            didAutoComplete.current = false
            return
        }
        if (open && !hasActiveUploads && failedCount === 0 && !didAutoComplete.current) {
            didAutoComplete.current = true
            onAllComplete?.()
        }
    }, [open, hasActiveUploads, failedCount, onAllComplete])

    const handleComplete = () => {
        didAutoComplete.current = true
        onOpenChange(false)
        onAllComplete?.()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CloudUpload className="size-5 text-primary"/>
                        Téléversement en cours
                    </DialogTitle>
                    <DialogDescription>
                        {hasActiveUploads
                            ? "Certains fichiers sont encore en cours de téléversement. Veuillez patienter."
                            : failedCount > 0
                                ? "Certains fichiers n'ont pas pu être téléversés."
                                : "Tous les fichiers ont été téléversés avec succès."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                    {activeUploads.length === 0 && failedCount === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Aucun téléversement en attente.
                        </p>
                    )}
                    {activeUploads.map((upload) => (
                        <UploadProgressRow key={upload.id} upload={upload}/>
                    ))}
                    {uploads
                        .filter((u) => u.status === "error")
                        .map((upload) => (
                            <UploadProgressRow key={upload.id} upload={upload}/>
                        ))}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            didAutoComplete.current = true
                            onOpenChange(false)
                        }}
                        disabled={hasActiveUploads}
                    >
                        Fermer
                    </Button>
                    <Button onClick={handleComplete} disabled={hasActiveUploads || failedCount > 0}>
                        Terminer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
