'use client';

import React, {Fragment, useEffect} from 'react';
import {Button} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {PlusIcon, FileTextIcon, TagIcon, FolderIcon, XIcon} from "lucide-react";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {CategoryVm, CreatePostInterface, PostVm} from "@/modules/blogging/domain/blogging.interface";
import {Input} from "@/core/presentation/ui/input";
import {Textarea} from "@/core/presentation/ui/textarea";
import {Label} from "@/core/presentation/ui/label";
import {Badge} from "@/core/presentation/ui/badge";
import {cn} from "@/core/infrastructure/utilities/utils";
import {useQueryClient} from "@tanstack/react-query";
import {BlogEditor} from "@/modules/blogging/presentation/components/blog-editor";

interface CreatePostStepperProps {
    post?: PostVm | null;
    children: React.ReactNode;
    triggerRef?: React.MutableRefObject<(() => void) | null>;
}

export function CreatePostStepper({post, children, triggerRef}: CreatePostStepperProps) {
    const isEditing = !!post;
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<CreatePostInterface>({
        size: 'FULL'
    });

    const getSteps = (): ModalStepperStep<CreatePostInterface>[] => [
        {
            id: 'edition',
            required: true,
            title: 'Édition',
            description: 'Rédaction de l\'article',
            content: ({updateData, data}) => (
                <EditorStepContent
                    data={data}
                    updateData={updateData}
                    isEditing={isEditing}
                />
            )
        },
        {
            id: 'confirmation',
            title: 'Aperçu',
            description: 'Vérification avant publication',
            content: ({data}) => {
                const cats: string[] = Array.isArray(data.categoryIds) ? data.categoryIds : [];
                const tags: string[] = Array.isArray(data.tagLabels) ? data.tagLabels : [];
                const autoSlug = data.slug || (data.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

                return (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col gap-y-6 p-6 bg-muted/30 rounded-lg border">
                            <div>
                                <h3 className="text-base font-bold border-b pb-2 mb-3 flex items-center gap-2">
                                    <FileTextIcon className="size-4 text-primary"/> Contenu
                                </h3>
                                <h1 className="text-2xl font-bold">{data.title || 'Sans titre'}</h1>
                                {autoSlug && (
                                    <p className="text-xs text-muted-foreground font-mono mt-1">/{autoSlug}</p>
                                )}
                                {data.description && (
                                    <p className="text-muted-foreground mt-3 line-clamp-2">{data.description}</p>
                                )}
                                {data.content && (
                                    <div
                                        className="mt-4 p-4 bg-background rounded-lg border prose prose-sm dark:prose-invert max-w-none max-h-[50dvh] overflow-y-auto"
                                        dangerouslySetInnerHTML={{__html: data.content}}
                                    />
                                )}
                            </div>
                            <div>
                                <h3 className="text-base font-bold border-b pb-2 mb-3 flex items-center gap-2">
                                    <FolderIcon className="size-4 text-primary"/> Organisation
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-muted-foreground">Catégories : </span>
                                        {cats.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {cats.map(id => (
                                                    <Badge key={id} variant="outline" className="text-xs">{id}</Badge>
                                                ))}
                                            </div>
                                        ) : 'Aucune'}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tags : </span>
                                        {tags.length > 0 ? tags.join(', ') : 'Aucun'}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-muted-foreground text-xs">
                                    {isEditing
                                        ? "L'article sera mis à jour avec ces informations."
                                        : "L'article sera créé en brouillon. Vous pourrez le publier depuis la liste."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        },
    ];

    const handleOpen = async () => {
        try {
            const initialData = post ? {
                title: post.title || '',
                slug: post.slug || '',
                description: post.description || '',
                content: post.content || '',
                categoryIds: post.categories?.map(c => c.id) || [],
                tagLabels: post.tags?.map(t => t.label) || [],
            } : {};

            await openStepper({
                steps: getSteps(),
                title: isEditing ? "Modifier l'article" : "Nouvel article",
                initialData,
                onEnd: async ({data}) => {
                    if (!data.title?.trim()) {
                        throw new Error("Le titre est requis.");
                    }
                    if (isEditing && post) {
                        await BloggingApiService.updatePost(post.id, {
                            title: data.title!.trim(),
                            slug: data.slug?.trim() || undefined,
                            description: data.description?.trim() || undefined,
                            content: data.content || undefined,
                            categoryIds: Array.isArray(data.categoryIds) && data.categoryIds.length > 0 ? data.categoryIds : undefined,
                            tagLabels: Array.isArray(data.tagLabels) && data.tagLabels.length > 0 ? data.tagLabels : undefined,
                        });
                        toast.success("Article modifié");
                    } else {
                        await BloggingApiService.createPost({
                            title: data.title!.trim(),
                            slug: data.slug?.trim() || undefined,
                            description: data.description?.trim() || undefined,
                            content: data.content || undefined,
                            categoryIds: Array.isArray(data.categoryIds) && data.categoryIds.length > 0 ? data.categoryIds : undefined,
                            tagLabels: Array.isArray(data.tagLabels) && data.tagLabels.length > 0 ? data.tagLabels : undefined,
                        });
                        toast.success("Article créé");
                    }
                    queryClient.invalidateQueries({queryKey: ['blog']});
                }
            });
        } catch (error) {
            console.error('Post stepper error:', error);
        }
    };

    useEffect(() => {
        if (triggerRef) {
            triggerRef.current = handleOpen;
        }
    }, []);

    return (
        <Fragment>
            {React.cloneElement(children as React.ReactElement<any>, {
                onClick: handleOpen
            })}
        </Fragment>
    );
}

function EditorStepContent({
    data,
    updateData,
    isEditing,
}: {
    data: Partial<CreatePostInterface>;
    updateData: (d: Partial<CreatePostInterface>) => void;
    isEditing: boolean;
}) {
    const [categories, setCategories] = React.useState<CategoryVm[]>([]);
    const [newTag, setNewTag] = React.useState("");
    const selectedCategoryIds: string[] = Array.isArray(data.categoryIds) ? data.categoryIds : [];
    const tags: string[] = Array.isArray(data.tagLabels) ? data.tagLabels : [];

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await BloggingApiService.getCategories();
                const cats = response.data?.data || response.data;
                setCategories(Array.isArray(cats) ? cats : []);
            } catch {}
        };
        fetchCategories();
    }, []);

    const toggleCategory = (id: string) => {
        const next = selectedCategoryIds.includes(id)
            ? selectedCategoryIds.filter(c => c !== id)
            : [...selectedCategoryIds, id];
        updateData({categoryIds: next});
    };

    const addTag = () => {
        const label = newTag.trim().toLowerCase();
        if (!label || tags.includes(label)) return;
        updateData({tagLabels: [...tags, label]});
        setNewTag("");
    };

    const autoSlug = data.slug
        ? data.slug
        : (data.title || '')
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    return (
        <div className="flex flex-col gap-6 h-full w-full">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Panneau droit : champs de métadonnées */}
                <div className="order-2 lg:order-2 w-full lg:w-[380px] shrink-0 space-y-5 overflow-y-auto">
                    <div className="bg-muted/20 rounded-lg border p-4 space-y-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Détails de l&apos;article
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="stepper-title">Titre *</Label>
                            <Input
                                id="stepper-title"
                                required
                                value={data.title || ''}
                                onChange={e => updateData({title: e.target.value})}
                                placeholder="Titre de l'article"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stepper-slug">
                                Slug
                                <span className="text-xs text-muted-foreground ml-1">(auto)</span>
                            </Label>
                            <Input
                                id="stepper-slug"
                                value={data.slug || ''}
                                onChange={e => updateData({slug: e.target.value})}
                                placeholder={autoSlug || "slug"}
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stepper-description">Description</Label>
                            <Textarea
                                id="stepper-description"
                                value={data.description || ''}
                                onChange={e => updateData({description: e.target.value})}
                                placeholder="Courte description"
                                rows={3}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-muted/20 rounded-lg border p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Catégories
                        </p>
                        {categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((cat) => {
                                    const selected = selectedCategoryIds.includes(cat.id);
                                    return (
                                        <Badge
                                            key={cat.id}
                                            variant={selected ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer transition-colors px-2.5 py-1 text-xs",
                                                selected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted"
                                            )}
                                            onClick={() => toggleCategory(cat.id)}
                                        >
                                            {selected && <span className="mr-1">✓</span>}
                                            <FolderIcon className="size-3 mr-1"/>
                                            {cat.title}
                                        </Badge>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">Aucune catégorie</p>
                        )}
                    </div>

                    <div className="bg-muted/20 rounded-lg border p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Tags
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder="Ajouter un tag..."
                                className="h-8 text-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={addTag}
                                disabled={!newTag.trim()}
                            >
                                <PlusIcon className="size-3.5"/>
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tags.map((label) => (
                                    <Badge key={label} variant="secondary" className="pr-1 text-xs">
                                        <TagIcon className="size-3 mr-1"/>
                                        {label}
                                        <button
                                            onClick={() => updateData({tagLabels: tags.filter(t => t !== label)})}
                                            className="ml-1 hover:text-destructive cursor-pointer"
                                        >
                                            <XIcon className="size-3"/>
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panneau gauche : éditeur WYSIWYG */}
                <div className="order-1 lg:order-1 flex-1 min-w-0 flex flex-col min-h-[60dvh]">
                    <Label className="text-sm font-medium mb-2">Contenu</Label>
                    <BlogEditor
                        value={data.content || ''}
                        onChange={(html) => updateData({content: html})}
                        placeholder="Commencez à rédiger votre article..."
                        minHeight="50dvh"
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
}

export function handleEditPost(
    post: PostVm,
    queryClient: ReturnType<typeof useQueryClient>,
    openEditStepper: ReturnType<typeof useModalStepper<CreatePostInterface>>
) {
    const getSteps = (): ModalStepperStep<CreatePostInterface>[] => {
        const localPost = post;
        return [
            {
                id: 'edition',
                required: true,
                title: 'Édition',
                description: 'Modification de l\'article',
                content: ({updateData, data}) => (
                    <EditorStepContent
                        data={data}
                        updateData={updateData}
                        isEditing={true}
                    />
                )
            },
            {
                id: 'confirmation',
                title: 'Aperçu',
                description: 'Récapitulatif',
                content: ({data}) => (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col gap-y-6 p-6 bg-muted/30 rounded-lg border">
                            <div>
                                <h3 className="text-base font-bold border-b pb-2 mb-3"><FileTextIcon className="size-4 text-primary inline mr-2"/>Contenu</h3>
                                <h1 className="text-2xl font-bold">{data.title || 'Sans titre'}</h1>
                                {data.description && <p className="text-muted-foreground mt-3 line-clamp-2">{data.description}</p>}
                                {data.content && (
                                    <div className="mt-4 p-4 bg-background rounded-lg border prose prose-sm dark:prose-invert max-w-none max-h-[50dvh] overflow-y-auto"
                                         dangerouslySetInnerHTML={{__html: data.content}}/>
                                )}
                            </div>
                            <div>
                                <h3 className="text-base font-bold border-b pb-2 mb-3"><FolderIcon className="size-4 text-primary inline mr-2"/>Organisation</h3>
                                <p className="text-muted-foreground">Catégories : {(Array.isArray(data.categoryIds) ? data.categoryIds.length : 0) || 'Aucune'}</p>
                                <p className="text-muted-foreground">Tags : {Array.isArray(data.tagLabels) ? data.tagLabels.join(', ') || 'Aucun' : 'Aucun'}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t"><p className="text-muted-foreground text-xs">L&apos;article sera mis à jour.</p></div>
                        </div>
                    </div>
                )
            },
        ];
    };

    return openEditStepper({
        steps: getSteps(),
        title: "Modifier l'article",
        initialData: {
            title: post.title || '',
            slug: post.slug || '',
            description: post.description || '',
            content: post.content || '',
            categoryIds: post.categories?.map(c => c.id) || [],
            tagLabels: post.tags?.map(t => t.label) || [],
        },
        onEnd: async ({data}) => {
            if (!data.title?.trim()) throw new Error("Le titre est requis.");
            await BloggingApiService.updatePost(post.id, {
                title: data.title!.trim(),
                slug: data.slug?.trim() || undefined,
                description: data.description?.trim() || undefined,
                content: data.content || undefined,
                categoryIds: Array.isArray(data.categoryIds) && data.categoryIds.length > 0 ? data.categoryIds : undefined,
                tagLabels: Array.isArray(data.tagLabels) && data.tagLabels.length > 0 ? data.tagLabels : undefined,
            });
            queryClient.invalidateQueries({queryKey: ['blog']});
            toast.success("Article modifié");
        }
    }).catch(() => {});
}
