"use client";

import React, {useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {CategoryVm, CreateCategoryInterface} from "@/modules/blogging/domain/blogging.interface";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {Textarea} from "@/core/presentation/ui/textarea";
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
import {PlusIcon, TrashIcon, PencilIcon, FolderIcon, CheckIcon, XIcon} from "lucide-react";
import {Separator} from "@/core/presentation/ui/separator";
import {Card, CardContent} from "@/core/presentation/ui/card";

export interface CategoriesManageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoriesManageDialog({open, onOpenChange}: CategoriesManageDialogProps) {
    const queryClient = useQueryClient();

    const [editCategory, setEditCategory] = useState<CategoryVm | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {data: categories, isLoading} = useQuery<CategoryVm[]>({
        queryKey: ['blog', 'categories'],
        queryFn: async () => {
            const response = await BloggingApiService.getCategories();
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: open,
    });

    const handleEdit = (category: CategoryVm) => {
        setEditCategory(category);
        setName(category.title || "");
        setDescription(category.description || "");
    };

    const handleCancelEdit = () => {
        setEditCategory(null);
        setName("");
        setDescription("");
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Le nom de la catégorie est requis");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editCategory) {
                await BloggingApiService.updateCategory(editCategory.id, {
                    title: name.trim(),
                    description: description.trim() || undefined,
                });
                toast.success("Catégorie modifiée");
            } else {
                const payload: CreateCategoryInterface = {
                    title: name.trim(),
                    description: description.trim() || undefined,
                };
                await BloggingApiService.createCategory(payload);
                toast.success("Catégorie créée");
            }
            queryClient.invalidateQueries({queryKey: ['blog']});
            handleCancelEdit();
        } catch {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await BloggingApiService.deleteCategory(id);
            toast.success("Catégorie supprimée");
            queryClient.invalidateQueries({queryKey: ['blog']});
            if (editCategory?.id === id) handleCancelEdit();
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[80dvh] flex flex-col gap-0 p-0">
                <DialogHeader className="px-4 py-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <FolderIcon className="size-5 text-primary"/>
                        Catégories
                    </DialogTitle>
                    <DialogDescription>
                        Gérez les catégories d&apos;articles
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {categories && categories.length > 0 && (
                        <div className="space-y-1.5">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`flex items-center justify-between p-2.5 rounded-md transition-colors ${editCategory?.id === cat.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 hover:bg-muted/50'}`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <FolderIcon className="size-4 text-muted-foreground shrink-0"/>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{cat.title}</p>
                                            {cat.description && (
                                                <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleEdit(cat)}
                                        >
                                            <PencilIcon className="size-3.5"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            <TrashIcon className="size-3.5 text-destructive"/>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && (!categories || categories.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Aucune catégorie créée
                        </p>
                    )}

                    <Separator/>

                    <div className="space-y-3 bg-muted/20 rounded-md p-3">
                        <div className="flex items-center gap-2">
                            {editCategory ? (
                                <PencilIcon className="size-4 text-primary"/>
                            ) : (
                                <PlusIcon className="size-4 text-primary"/>
                            )}
                            <p className="text-sm font-medium">
                                {editCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="catName">Nom *</Label>
                            <Input
                                id="catName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nom de la catégorie"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="catDesc">Description</Label>
                            <Textarea
                                id="catDesc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description (optionnelle)"
                                rows={2}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={isSubmitting || !name.trim()}
                                size="sm"
                            >
                                <CheckIcon className="size-3.5 mr-1.5"/>
                                {isSubmitting
                                    ? "Enregistrement..."
                                    : editCategory ? "Modifier" : "Créer"}
                            </Button>
                            {editCategory && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                >
                                    <XIcon className="size-3.5 mr-1.5"/>
                                    Annuler
                                </Button>
                            )}
                        </div>
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
