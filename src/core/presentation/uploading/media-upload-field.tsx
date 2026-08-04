import {UserMediaFieldConfig} from "@/core/domain/typing/user-media-upload";
import {MediaStorageInterface, MediaUploadOptions} from "@/core/domain/entities/media";
import {useEffect, useRef, useState} from "react";
import {useUploadStore} from "@/core/infrastructure/stores/upload.store";
import {CheckCircle2, FileText, ImageIcon, Loader2, Trash2, Upload, X} from "lucide-react";
import {formatFileSize} from "@/core/infrastructure/utilities/format.util";
import {MediaLabelService} from "@/core/infrastructure/utilities/media-label.service";
import {StorageMedia} from "@/modules/storage/presentation/components/storage-media";
import {Button} from "@/core/presentation/ui/button";
import {Progress} from "@/core/presentation/ui/progress";


export interface MediaUploadFieldProps {
    moduleKey: string;
    field: UserMediaFieldConfig;
    value?: MediaStorageInterface;
    onChange: (media?: MediaStorageInterface) => void;
}

export function MediaUploadField({field, value, onChange, moduleKey}: MediaUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const uploadFile = useUploadStore((state) => state.uploadFile);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string>();
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string>();

    useEffect(() => {
        return () => {
            if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        };
    }, [localPreviewUrl]);

    const isStoredImage = value?.id
        ? MediaLabelService.sectionFor({mime: value.type, extension: value.filename?.split(".").pop() ?? ""}) === "image"
        : false;

    const handleSelect = async (file?: File | null) => {
        if (!file) return;
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(URL.createObjectURL(file));
        setError(undefined);
        setIsUploading(true);
        setProgress(0);

        const options: MediaUploadOptions = {module: moduleKey, type: field.type};
        try {
            const media = await uploadFile(file, options, (event) => {
                setProgress(event.total ? (event.loaded / event.total) * 100 : 0);
            }) as MediaStorageInterface | undefined;
            if (!media) throw new Error('Réponse invalide du serveur');
            setLocalPreviewUrl(undefined);
            onChange(media);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Une erreur est survenue lors du téléversement');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div data-slot="media-upload-field" className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background ring-1 ring-foreground/10">
                    {localPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={localPreviewUrl} alt={field.label} className="size-full object-cover"/>
                    ) : isStoredImage ? (
                        <StorageMedia id={value!.id!} className="size-full"/>
                    ) : value ? (
                        <FileText className="size-6 text-muted-foreground"/>
                    ) : (
                        <ImageIcon className="size-6 text-muted-foreground"/>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{field.label}</p>
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                    {value?.filename && !isUploading && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {value.filename} · {formatFileSize(value.metadata?.size ?? 0)}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {value && !isUploading && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onChange(undefined)}
                            aria-label={`Retirer ${field.label.toLowerCase()}`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-4"/>
                        </Button>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            handleSelect(e.target.files?.[0]);
                            e.target.value = "";
                        }}
                    />
                    <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
                        {value && !isUploading ? (
                            <>
                                <Upload className="size-3.5"/>
                                Remplacer
                            </>
                        ) : (
                            <>
                                <Upload className="size-3.5"/>
                                Téléverser
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {isUploading && (
                <div className="mt-3 flex items-center gap-2">
                    <Progress value={progress} className="h-1.5 flex-1"/>
                    <span className="w-11 text-right text-xs tabular-nums text-muted-foreground">
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
            {error ? (
                <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
                    <X className="size-3"/>
                    {error}
                </p>
            ) : value && !isUploading ? (
                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="size-3"/>
                    Fichier téléversé avec succès
                </p>
            ) : isUploading ? (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin"/>
                    Téléversement en cours…
                </p>
            ) : null}
        </div>
    );
}
