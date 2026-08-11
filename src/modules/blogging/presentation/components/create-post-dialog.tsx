"use client";

import React, {useEffect, useState, useMemo} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {CategoryVm, CreatePostInterface, PostVm, UpdatePostInterface} from "@/modules/blogging/domain/blogging.interface";
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
import {PlusIcon, TagIcon, XIcon} from "lucide-react";
import {Badge} from "@/core/presentation/ui/badge";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface CreatePostDialogProps {
    post?: PostVm | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreatePostDialog({post, open, onOpenChange, onSuccess}: CreatePostDialogProps) {
    const isEditing = !!post;
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [tagLabels, setTagLabels] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {data: categories} = useQuery<CategoryVm[]>({
        queryKey: ['blog', 'categories'],
        queryFn: async () => {
            const response = await BloggingApiService.getCategories();
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: open,
    });

    useEffect(() => {
        if (post) {
            setTitle(post.title || "");
            setSlug(post.slug || "");
            setDescription(post.description || "");
            setContent(post.content || "");
            setCategoryIds(post.categories?.map(c => c.id) || []);
            setTagLabels(post.tags?.map(t => t.label) || []);
        } else {
            setTitle("");
            setSlug("");
            setDescription("");
            setContent("");
            setCategoryIds([]);
            setTagLabels([]);
        }
        setNewTag("");
    }, [post, open]);

    const autoSlug = useMemo(() => {
        if (slug) return slug;
        return title
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }, [title, slug]);

    const toggleCategory = (id: string) => {
        setCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const addTag = () => {
        const label = newTag.trim().toLowerCase();
        if (!label || tagLabels.includes(label)) return;
        setTagLabels(prev => [...prev, label]);
        setNewTag("");
    };

    const removeTag = (label: string) => {
        setTagLabels(prev => prev.filter(t => t !== label));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Le titre est requis");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && post) {
                const payload: UpdatePostInterface = {
                    title: title.trim(),
                    slug: slug.trim() || undefined,
                    description: description.trim() || undefined,
                    content: content || undefined,
                    categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
                    tagLabels: tagLabels.length > 0 ? tagLabels : undefined,
                };
                await BloggingApiService.updatePost(post.id, payload);
                toast.success("Article modifié");
            } else {
                const payload: CreatePostInterface = {
                    title: title.trim(),
                    slug: slug.trim() || undefined,
                    description: description.trim() || undefined,
                    content: content || undefined,
                    categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
                    tagLabels: tagLabels.length > 0 ? tagLabels : undefined,
                };
                await BloggingApiService.createPost(payload);
                toast.success("Article créé");
            }
            queryClient.invalidateQueries({queryKey: ['blog']});
            onSuccess();
        } catch {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col gap-0 p-0">
                <DialogHeader className="px-4 py-4 border-b shrink-0">
                    <DialogTitle>
                        {isEditing ? "Modifier l'article" : "Nouvel article"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifiez les informations de l'article"
                            : "Remplissez les informations pour créer un nouvel article"}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto px-4 py-4 space-y-4 flex-1">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titre de l'article"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">
                            Slug
                            <span className="text-xs text-muted-foreground ml-1">(auto-généré si vide)</span>
                        </Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder={autoSlug || "slug-de-l-article"}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Catégories</Label>
                        {categories && categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-9 bg-muted/20">
                                {categories.map((cat) => {
                                    const selected = categoryIds.includes(cat.id);
                                    return (
                                        <Badge
                                            key={cat.id}
                                            variant={selected ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer transition-colors px-2 py-1",
                                                selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                            )}
                                            onClick={() => toggleCategory(cat.id)}
                                        >
                                            {selected && <span className="mr-1">✓</span>}
                                            {cat.title}
                                        </Badge>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/20">
                                Aucune catégorie disponible
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="tags"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Ajouter un tag..."
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={addTag}
                                disabled={!newTag.trim()}
                            >
                                <PlusIcon className="size-4"/>
                            </Button>
                        </div>
                        {tagLabels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-9 bg-muted/20">
                                {tagLabels.map((label) => (
                                    <Badge key={label} variant="secondary" className="pr-1">
                                        <TagIcon className="size-3 mr-1"/>
                                        {label}
                                        <button
                                            onClick={() => removeTag(label)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <XIcon className="size-3"/>
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brève description de l'article"
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="content">Contenu</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Contenu de l'article (HTML supporté)"
                            rows={10}
                            className="font-mono text-xs"
                        />
                    </div>
                </div>

                <DialogFooter className="px-4 py-3 border-t shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title.trim()}
                    >
                        {isSubmitting ? "Enregistrement..." : isEditing ? "Modifier" : "Créer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
