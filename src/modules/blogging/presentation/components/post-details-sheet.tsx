"use client";

import React from "react";
import {PostVm} from "@/modules/blogging/domain/blogging.interface";
import {Badge} from "@/core/presentation/ui/badge";
import {Separator} from "@/core/presentation/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {
    CalendarIcon,
    ClockIcon,
    FileTextIcon,
    GlobeIcon,
    PencilIcon,
    TagIcon,
    UserIcon,
    ImageIcon,
    UsersIcon,
    HistoryIcon,
    ExternalLinkIcon,
} from "lucide-react";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/core/presentation/ui/sheet";
import {Button} from "@/core/presentation/ui/button";

export interface PostDetailsSheetProps {
    post: PostVm;
    children?: React.ReactNode;
    opened?: boolean;
    onOpenChange?: (status: boolean) => void;
    onCollaborators?: (post: PostVm) => void;
    onMedia?: (post: PostVm) => void;
    onCommit?: (post: PostVm) => void;
}

export function PostDetailsSheet({
    children,
    opened,
    onOpenChange,
    post,
    onCollaborators,
    onMedia,
    onCommit,
}: PostDetailsSheetProps) {
    if (!post) return null;

    const formatDate = (date?: string) => {
        if (!date) return "—";
        return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", {locale: fr});
    };

    const isPublished = !!post.publishedAt || post.status === 'published';

    return (
        <Sheet open={opened} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg p-0 flex flex-col gap-0"
            >
                <SheetHeader className="px-4 py-4 border-b shrink-0">
                    <SheetTitle className="text-lg flex items-center gap-2 truncate">
                        <FileTextIcon className="size-5 text-primary shrink-0"/>
                        <span className="truncate">{post.title}</span>
                    </SheetTitle>
                    <SheetDescription>
                        {post.slug && (
                            <span className="font-mono text-xs">/{post.slug}</span>
                        )}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="general" className="w-full">
                        <div className="px-4 pt-4 sticky top-0 bg-popover z-10">
                            <TabsList className="w-full">
                                <TabsTrigger value="general" className="flex-1 text-xs">Général</TabsTrigger>
                                <TabsTrigger value="content" className="flex-1 text-xs">Contenu</TabsTrigger>
                                <TabsTrigger value="versions" className="flex-1 text-xs">Versions</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="general" className="p-4 space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="px-2 py-1">
                                    {isPublished ? (
                                        <>
                                            <GlobeIcon className="size-3.5 text-emerald-500 mr-1"/>
                                            Publié
                                        </>
                                    ) : (
                                        <>
                                            <PencilIcon className="size-3.5 text-amber-500 mr-1"/>
                                            Brouillon
                                        </>
                                    )}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onCollaborators?.(post)}
                                >
                                    <UsersIcon className="size-3.5 mr-1.5"/>
                                    Collaborateurs
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onMedia?.(post)}
                                >
                                    <ImageIcon className="size-3.5 mr-1.5"/>
                                    Médias
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onCommit?.(post)}
                                >
                                    <HistoryIcon className="size-3.5 mr-1.5"/>
                                    Versionner
                                </Button>
                            </div>

                            <Separator/>

                            {post.categories && post.categories.length > 0 && (
                                <>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Catégories</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.categories.map((cat) => (
                                                <Badge key={cat.id} variant="outline" className="px-2 py-1">
                                                    <TagIcon className="size-3 mr-1"/>
                                                    {cat.title}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {post.tags && post.tags.length > 0 && (
                                <>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.tags.map((tag) => (
                                                <Badge key={tag.id} variant="secondary" className="px-2 py-1">
                                                    {tag.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="size-4 text-muted-foreground mt-0.5 shrink-0"/>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Créé le</p>
                                        <p className="text-sm">{formatDate(post.createdAt)}</p>
                                    </div>
                                </div>
                                {post.updatedAt && (
                                    <div className="flex items-start gap-3">
                                        <ClockIcon className="size-4 text-muted-foreground mt-0.5 shrink-0"/>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Mis à jour le</p>
                                            <p className="text-sm">{formatDate(post.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}
                                {post.publishedAt && (
                                    <div className="flex items-start gap-3">
                                        <GlobeIcon className="size-4 text-emerald-500 mt-0.5 shrink-0"/>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Publié le</p>
                                            <p className="text-sm">{formatDate(post.publishedAt)}</p>
                                        </div>
                                    </div>
                                )}
                                {post.author && (
                                    <div className="flex items-start gap-3">
                                        <UserIcon className="size-4 text-muted-foreground mt-0.5 shrink-0"/>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Auteur</p>
                                            <p className="text-sm font-medium">
                                                {post.author.fullName || post.author.username || post.author.email}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {post.description && (
                                <>
                                    <Separator/>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm">{post.description}</p>
                                    </div>
                                </>
                            )}

                            {post.collaborators && post.collaborators.length > 0 && (
                                <>
                                    <Separator/>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Collaborateurs ({post.collaborators.length})
                                        </p>
                                        <div className="space-y-2">
                                            {post.collaborators.map((c) => (
                                                <div key={c.id} className="flex items-center gap-2 text-sm">
                                                    <UserIcon className="size-3.5 text-muted-foreground"/>
                                                    <span>{c.username || c.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="content" className="p-4">
                            {post.content ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div dangerouslySetInnerHTML={{__html: post.content}}/>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-8">
                                    Aucun contenu
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="versions" className="p-4">
                            {post.versions && post.versions.length > 0 ? (
                                <div className="space-y-3">
                                    {post.versions.map((v) => (
                                        <div key={v.id} className="p-3 rounded-lg border bg-muted/30">
                                            <div className="flex items-center justify-between mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {v.versionName}
                                                </Badge>
                                                {v.createdAt && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(v.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            {v.payload && (
                                                <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto max-h-32 overflow-y-auto bg-muted/50 rounded p-2">
                                                    {JSON.stringify(v.payload, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-8">
                                    Aucune version enregistrée
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    )
}
