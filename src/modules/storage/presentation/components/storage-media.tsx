"use client"

import * as React from "react"
import {useEffect, useMemo, useState} from "react"
import {StorageApiService} from "@/modules/storage/application/service/storage-api-service"
import type {MediaStorageInterface} from "@/core/domain/entities/media"
import {MediaLabelService} from "@/core/infrastructure/utilities/media-label.service"
import {WaitingActivity} from "@/core/presentation/waiting-activity"
import {Progress} from "@/core/presentation/ui/progress"
import {Button} from "@/core/presentation/ui/button"
import {cn} from "@/core/infrastructure/utilities/utils"
import {
    DownloadIcon,
    FileArchiveIcon,
    FileAudioIcon,
    FileCodeIcon,
    FileIcon,
    FileImageIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    FileVideoIcon,
} from "lucide-react"

export interface StorageMediaProps {
    id: string
    className?: string
}

function extensionOf(filename: string): string {
    return (filename?.split(".").pop() ?? "").toLowerCase()
}

function documentIconFor(mime: string, extension: string) {
    const ext = extension.toLowerCase();
    const type = (mime || "").toLowerCase();

    if (type.includes("zip") || type.includes("compress") || type.includes("rar") || type.includes("tar") || ["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        return FileArchiveIcon;
    }
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv") || ["xls", "xlsx", "csv"].includes(ext)) {
        return FileSpreadsheetIcon;
    }
    if (type.includes("json") || type.includes("xml") || type.includes("html") || type.includes("javascript") || type.includes("typescript") || ["js", "ts", "json", "xml", "html", "css", "py", "java", "sh"].includes(ext)) {
        return FileCodeIcon;
    }
    return FileTextIcon;
}

export function StorageMedia({id, className}: StorageMediaProps) {
    const [media, setMedia] = useState<MediaStorageInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        StorageApiService.getById(id)
            .then(response => {
                if (cancelled) return;
                setMedia((response.data?.data ?? response.data) ?? null);
            })
            .catch((err: any) => {
                if (cancelled) return;
                setError(err?.response?.data?.message ?? err?.message ?? "Une erreur est survenue");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const extension = extensionOf(media?.filename ?? "");
    const isImage = media
        ? MediaLabelService.sectionFor({mime: media.type, extension}) === "image"
        : false;

    useEffect(() => {
        if (!media || !isImage) return;

        let objectUrl: string | null = null;
        let cancelled = false;
        setImageLoading(true);
        StorageApiService.getFile(id, {responseType: "blob"})
            .then(response => {
                if (cancelled) return;
                objectUrl = URL.createObjectURL(response.data);
                setImageUrl(objectUrl);
            })
            .catch((err: any) => {
                if (cancelled) return;
                setError(err?.response?.data?.message ?? err?.message ?? "Une erreur est survenue");
            })
            .finally(() => {
                if (!cancelled) setImageLoading(false);
            });
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [id, media, isImage]);

    const Icon = useMemo(() => {
        if (!media) return FileIcon;
        const section = MediaLabelService.sectionFor({mime: media.type, extension});
        switch (section) {
            case "image":
                return FileImageIcon;
            case "video":
                return FileVideoIcon;
            case "audio":
                return FileAudioIcon;
            case "document":
                return documentIconFor(media.type, extension);
            default:
                return FileIcon;
        }
    }, [media, extension]);

    const handleDownload = async () => {
        if (!media) return;
        setDownloading(true);
        setProgress(0);
        try {
            const response = await StorageApiService.getFile(id, {
                responseType: "blob",
                onDownloadProgress: event => {
                    if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
                    else if (event.progress != null) setProgress(Math.round(event.progress * 100));
                },
            });
            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = media.filename || "download";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? "Une erreur est survenue");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className={cn("flex flex-auto items-center justify-center", className)}>
                <WaitingActivity size={24}/>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("flex flex-auto items-center justify-center p-4 text-sm text-destructive", className)}>
                {error}
            </div>
        );
    }

    if (!media) {
        return (
            <div className={cn("flex flex-auto items-center justify-center p-4 text-sm text-muted-foreground", className)}>
                Aucun fichier trouvé
            </div>
        );
    }

    if (isImage) {
        return (
            <div className={cn("relative flex flex-auto items-center justify-center overflow-hidden", className)}>
                {imageLoading && <WaitingActivity size={24}/>}
                {imageUrl && !imageLoading && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={media.filename} className="size-full object-cover"/>
                )}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 p-6 text-center", className)}>
            <div className="flex size-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-8"/>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1">
                <p className="max-w-full truncate text-sm font-medium">{media.filename}</p>
                <p className="text-xs text-muted-foreground">{media.type || "Fichier"}</p>
            </div>
            {downloading ? (
                <div className="flex w-full max-w-xs flex-col gap-1.5">
                    <Progress value={progress}/>
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
            ) : (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                    <DownloadIcon/>
                    Télécharger
                </Button>
            )}
        </div>
    );
}
