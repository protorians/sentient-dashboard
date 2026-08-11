"use client";

import React, {useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {CollaboratorVm, PostVm} from "@/modules/blogging/domain/blogging.interface";
import {UsersApiService} from "@/modules/users/application/service/users-api-service";
import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {getFullName} from "@/modules/users/infrastructure/utilities/users-name.util";
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
import {UserIcon, XIcon, SearchIcon, PlusIcon} from "lucide-react";
import {Avatar, AvatarFallback} from "@/core/presentation/ui/avatar";
import {Separator} from "@/core/presentation/ui/separator";


export interface PostCollaboratorsDialogProps {
    post: PostVm;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PostCollaboratorsDialog({post, open, onOpenChange, onSuccess}: PostCollaboratorsDialogProps) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const currentCollaboratorIds = new Set(
        (post.collaborators || []).map(c => c.userId).filter(Boolean) as string[]
    );

    const {data: users, isLoading} = useQuery<UserInterface[]>({
        queryKey: ['users', 'search', searchTerm || 'all'],
        queryFn: async () => {
            const response = await UsersApiService.getAll({search: searchTerm || undefined, limit: 50});
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: open,
    });

    const availableUsers = (users || []).filter(u => !currentCollaboratorIds.has(u.id || ''));

    const handleAdd = async (userId: string) => {
        setIsAdding(true);
        try {
            await BloggingApiService.addCollaborator(post.id, userId);
            toast.success("Collaborateur ajouté");
            queryClient.invalidateQueries({queryKey: ['blog']});
            onSuccess();
        } catch {
            toast.error("Erreur lors de l'ajout");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (userId: string) => {
        try {
            await BloggingApiService.removeCollaborator(post.id, userId);
            toast.success("Collaborateur retiré");
            queryClient.invalidateQueries({queryKey: ['blog']});
            onSuccess();
        } catch {
            toast.error("Erreur lors du retrait");
        }
    };

    const getInitials = (user: UserInterface) => {
        const fullName = getFullName(user);
        return fullName ? fullName.substring(0, 2).toUpperCase() : (user.username?.substring(0, 2).toUpperCase() || "U");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85dvh] flex flex-col gap-0 p-0">
                <DialogHeader className="px-4 py-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <UserIcon className="size-5 text-primary"/>
                        Collaborateurs
                    </DialogTitle>
                    <DialogDescription>
                        Gérer les collaborateurs de l&apos;article
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {post.collaborators && post.collaborators.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">
                                Collaborateurs actuels ({post.collaborators.length})
                            </p>
                            <div className="space-y-1">
                                {post.collaborators.map((c) => (
                                    <div key={c.id}
                                         className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Avatar size="sm">
                                                <AvatarFallback className="text-xs">
                                                    {c.username?.substring(0, 2).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm truncate">{c.username || c.email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleRemove(c.userId)}
                                            className="shrink-0"
                                        >
                                            <XIcon className="size-3.5 text-destructive"/>
                                        </Button>
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
                                placeholder="Rechercher un utilisateur..."
                                className="pl-8"
                            />
                        </div>

                        {isLoading ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                Recherche...
                            </div>
                        ) : availableUsers.length > 0 ? (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {availableUsers.map((user) => (
                                    <div key={user.id}
                                         className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Avatar size="sm">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm truncate">{getFullName(user) || user.username}</p>
                                                {user.email && (
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleAdd(user.id || '')}
                                            disabled={isAdding}
                                            className="shrink-0"
                                        >
                                            <PlusIcon className="size-3.5 text-primary"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {searchTerm ? "Aucun utilisateur trouvé" : "Saisissez un nom pour rechercher"}
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
