"use client";

import React, {useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {PostMediaVm, PostVm} from "@/modules/blogging/domain/blogging.interface";
import {StorageApiService} from "@/modules/storage/application/service/storage-api-service";
import {MediaStorageInterface} from "@/core/domain/entities/media";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/core/presentation/ui/dialog";
import {ImageIcon, XIcon, SearchIcon, PlusIcon, FileIcon, FileTypeIcon} from "lucide-react";
import {Separator} from "@/core/presentation/ui/separator";

export interface PostMediaDialogProps {
    post: PostVm;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

function MediaIcon({type}: { type?: string }) {
    if (type?.startsWith('image/')) return <ImageIcon className="size-8 text-muted-foreground"/>;
    if (type?.startsWith('video/')) return <FileTypeIcon className="size-8 text-muted-foreground"/>;
    return <FileIcon className="size-8 text-muted-foreground"/>;
}

export function PostMediaDialog({post, open, onOpenChange, onSuccess}: PostMediaDialogProps) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const currentMediaIds = new Set(
        (post.media || []).map(m => m.mediaId).filter(Boolean) as string[]
    );

    const {data: allMedia, isLoading} = useQuery<MediaStorageInterface[]>({
        queryKey: ['storage', 'all', searchTerm || 'list'],
        queryFn: async () => {
            const response = await StorageApiService.getAll();
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: open,
    });

    const filteredMedia = (allMedia || [])
        .filter(m => !currentMediaIds.has(m.id || ''))
        .filter(m => !searchTerm || (m.filename?.toLowerCase().includes(searchTerm.toLowerCase()) || m.label?.toLowerCase().includes(searchTerm.toLowerCase())));

    const handleAdd = async (mediaId: string) => {
        setIsAdding(true);
        try {
            await BloggingApiService.addMedia(post.id, mediaId);
            toast.success("Média ajouté");
            queryClient.invalidateQueries({queryKey: ['blog']});
            onSuccess();
        } catch {
            toast.error("Erreur lors de l'ajout");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (mediaId: string) => {
        try {
            await BloggingApiService.removeMedia(post.id, mediaId);
            toast.success("Média retiré");
            queryClient.invalidateQueries({queryKey: ['blog']});
            onSuccess();
        } catch {
            toast.error("Erreur lors du retrait");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85dvh] flex flex-col gap-0 p-0">
                <DialogHeader className="px-4 py-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="size-5 text-primary"/>
                        Médias
                    </DialogTitle>
                    <DialogDescription>
                        Gérer les médias attachés à l&apos;article
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {post.media && post.media.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">
                                Médias attachés ({post.media.length})
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {post.media.map((m) => (
                                    <div key={m.id}
                                         className="relative aspect-square rounded-md bg-muted/50 overflow-hidden group">
                                        {m.type?.startsWith('image/') ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_HOST}/storage/${m.mediaId}`}
                                                alt={m.filename || m.label || ''}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                                <MediaIcon type={m.type}/>
                                                <span className="text-xs text-muted-foreground truncate max-w-full px-1">
                                                    {m.filename || m.label || 'Fichier'}
                                                </span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleRemove(m.mediaId)}
                                            className="absolute top-1 right-1 bg-destructive/90 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <XIcon className="size-3 text-white"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator/>

                    <div>
                        <div className="relative mb-3">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher un média..."
                                className="pl-8"
                            />
                        </div>

                        {isLoading ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                Chargement...
                            </div>
                        ) : filteredMedia.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                {filteredMedia.map((media) => (
                                    <div key={media.id}
                                         className="relative aspect-square rounded-md bg-muted/50 overflow-hidden group cursor-pointer"
                                         onClick={() => media.id && handleAdd(media.id)}
                                    >
                                        {media.type?.startsWith('image/') ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_HOST}/storage/${media.id}`}
                                                alt={media.filename || media.label || ''}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                                <MediaIcon type={media.type}/>
                                                <span className="text-xs text-muted-foreground truncate max-w-full px-1">
                                                    {media.filename || media.label || 'Fichier'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <PlusIcon className="size-6 text-primary"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {searchTerm ? "Aucun média trouvé" : "Aucun média disponible"}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-4 py-3 border-t shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
