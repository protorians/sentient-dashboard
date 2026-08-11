"use client";

import React, {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {PostVm} from "@/modules/blogging/domain/blogging.interface";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {Label} from "@/core/presentation/ui/label";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/core/presentation/ui/dialog";
import {HistoryIcon} from "lucide-react";

export interface PostCommitDialogProps {
    post: PostVm;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PostCommitDialog({post, open, onOpenChange, onSuccess}: PostCommitDialogProps) {
    const queryClient = useQueryClient();
    const [versionName, setVersionName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommit = async () => {
        setIsSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                versionName: versionName.trim() || undefined,
                title: post.title,
                description: post.description,
                content: post.content,
            };
            await BloggingApiService.commitPost(post.id, payload);
            toast.success("Version sauvegardée");
            queryClient.invalidateQueries({queryKey: ['blog']});
            onSuccess();
        } catch {
            toast.error("Erreur lors du versionnage");
        } finally {
            setIsSubmitting(false);
        }
    };

    const existingVersions = post.versions?.length || 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HistoryIcon className="size-5 text-primary"/>
                        Sauvegarder une version
                    </DialogTitle>
                    <DialogDescription>
                        Créez un point de sauvegarde de l&apos;état actuel de l&apos;article
                        {existingVersions > 0 && (
                            <span className="block mt-1">
                                {existingVersions} version{existingVersions > 1 ? 's' : ''} existante{existingVersions > 1 ? 's' : ''}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        {post.slug && (
                            <p className="text-xs text-muted-foreground font-mono">/{post.slug}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="versionName">
                            Nom de version
                            <span className="text-xs text-muted-foreground ml-1">(optionnel, auto-généré sinon)</span>
                        </Label>
                        <Input
                            id="versionName"
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            placeholder="ex: Version stable, Draft v2..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleCommit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Enregistrement..." : "Sauvegarder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
