"use client"

import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid";
import {getBlogColumns} from "@/modules/blogging/presentation/components/blog-columns";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {PostFilterOptions, PostVm} from "@/modules/blogging/domain/blogging.interface";
import {AppConfig} from "@/core/domain/config/app.config";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {
    EyeIcon,
    FileTextIcon,
    PencilIcon,
    GlobeIcon,
    GlobeOffIcon,
    TrashIcon,
    UsersIcon,
    ImageIcon,
    HistoryIcon
} from "lucide-react";
import {Button} from "@/core/presentation/ui/button";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store";
import {Fragment, useEffect, useState} from "react";
import {DataGridSearchEngine} from "@/core/presentation/data-grid/data-grid-search-engine";
import {PaginationState, Table} from "@tanstack/react-table";
import {FetchResponseMetaProps} from "@/core/domain/typing/response";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {PostDetailsSheet} from "@/modules/blogging/presentation/components/post-details-sheet";
import {handleEditPost} from "@/modules/blogging/presentation/components/create-post-stepper";
import {PostCollaboratorsDialog} from "@/modules/blogging/presentation/components/post-collaborators-dialog";
import {PostMediaDialog} from "@/modules/blogging/presentation/components/post-media-dialog";
import {PostCommitDialog} from "@/modules/blogging/presentation/components/post-commit-dialog";
import {useModalStepper} from "@/core/presentation/modals/components/ModalStepper";
import {CreatePostInterface} from "@/modules/blogging/domain/blogging.interface";

export function BlogDataGrid() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [mounted, setMounted] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false);

    const [detailsPost, setDetailsPost] = useState<PostVm | null>(null)
    const [collaboratorsPost, setCollaboratorsPost] = useState<PostVm | null>(null)
    const [mediaPost, setMediaPost] = useState<PostVm | null>(null)
    const [commitPost, setCommitPost] = useState<PostVm | null>(null)

    const {getCurrentUser} = authUserConnectedStore()
    const queryClient = useQueryClient();
    const router = useRouter()
    const openEditStepper = useModalStepper<CreatePostInterface>({ size: 'XL' });
    const [data, setData] = useState<PostVm[]>([])
    const [meta, setMeta] = useState<FetchResponseMetaProps | undefined>()

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const options: Record<string, unknown> = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            }
            if (searchTerm.length >= 2) options.search = searchTerm
            const response = await BloggingApiService.getAllPosts(options);
            const responseData = response.data
            setData(Array.isArray(responseData?.data) ? responseData.data : Array.isArray(responseData) ? responseData as unknown as PostVm[] : [])
            setMeta(responseData?.meta as FetchResponseMetaProps || undefined)
        } catch {
            // handled by ApiService
        }
        setLoading(false);
    }

    const {isLoading} = useQuery({
        queryKey: ['blog', 'posts', 'table', searchTerm || 'all', pagination.pageIndex, pagination.pageSize],
        enabled: !!getCurrentUser,
        queryFn: fetchPosts,
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const deleteItems = async (selected: PostVm[]) => {
        try {
            const promises = selected.map(s => BloggingApiService.deletePost(s.id))
            await Promise.all(promises)
            toast.success("Articles supprimés avec succès")
            queryClient.invalidateQueries({queryKey: ['blog']})
        } catch {
            toast.error("Erreur lors de la suppression")
        }
    }

    const handlePublish = async (post: PostVm) => {
        try {
            await BloggingApiService.publishPost(post.id)
            toast.success("Article publié")
            queryClient.invalidateQueries({queryKey: ['blog']})
        } catch {
            toast.error("Erreur lors de la publication")
        }
    }

    const handleUnpublish = async (post: PostVm) => {
        try {
            await BloggingApiService.unpublishPost(post.id)
            toast.success("Article dépublié")
            queryClient.invalidateQueries({queryKey: ['blog']})
        } catch {
            toast.error("Erreur lors de la dépublication")
        }
    }

    const invalidate = () => queryClient.invalidateQueries({queryKey: ['blog']})

    const toolbar = (table: Table<PostVm>) => (
        <Fragment>
            <DataGridSearchEngine
                table={table}
                value={searchTerm}
                onChange={value => setSearchTerm(value)}
            />
            {isLoading && (
                <div className="flex-auto flex items-center justify-center">
                    <WaitingActivity size={16}/>
                </div>
            )}
        </Fragment>
    )

    const pageCount = meta?.total && meta?.limit ? Math.ceil(meta.total / meta.limit) : 0;

    const isPublished = (p: PostVm) => !!p.publishedAt || p.status === 'published'

    const rowActions = (post: PostVm): RowAction<PostVm>[] => {
        const published = isPublished(post)
        const actions: RowAction<PostVm>[] = [
            {
                id: "details",
                label: "Détails",
                icon: <EyeIcon className="size-4"/>,
                onExecute: (p) => setDetailsPost(p),
            },
            {
                id: "edit",
                label: "Modifier",
                icon: <PencilIcon className="size-4"/>,
                onExecute: (p) => handleEditPost(p, queryClient, openEditStepper).catch(() => {}),
            },
        ]

        if (!published) {
            actions.push({
                id: "publish",
                label: "Publier",
                icon: <GlobeIcon className="size-4 text-emerald-500"/>,
                onExecute: (p: PostVm) => handlePublish(p),
            })
        } else {
            actions.push({
                id: "unpublish",
                label: "Dépublier",
                icon: <GlobeOffIcon className="size-4 text-amber-500"/>,
                onExecute: (p: PostVm) => handleUnpublish(p),
            })
        }

        actions.push(
            {
                id: "collaborators",
                label: "Collaborateurs",
                icon: <UsersIcon className="size-4"/>,
                onExecute: (p) => setCollaboratorsPost(p),
            },
            {
                id: "media",
                label: "Médias",
                icon: <ImageIcon className="size-4"/>,
                onExecute: (p) => setMediaPost(p),
            },
            {
                id: "commit",
                label: "Versionner",
                icon: <HistoryIcon className="size-4"/>,
                onExecute: (p) => setCommitPost(p),
            },
            {
                id: "delete",
                label: "Supprimer",
                variant: "destructive",
                icon: <TrashIcon className="size-4"/>,
                onExecute: async (p) => {
                    await deleteItems([p])
                },
            },
        )

        return actions
    }

    const blogColumns = getBlogColumns()

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, []);

    return (
        <div className="flex-auto">
            {(data.length || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={data}
                        columns={blogColumns}
                        getRowId={row => row.id}
                        enableSelection
                        actions={rowActions}
                        manualPagination
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        toolbar={(table) => toolbar(table)}
                        bulkActions={[
                            {
                                id: "publish-all",
                                label: "Publier",
                                onExecute: async (selected) => {
                                    try {
                                        await Promise.all(selected.map(s => BloggingApiService.publishPost(s.id)))
                                        toast.success("Articles publiés")
                                        invalidate()
                                    } catch {
                                        toast.error("Erreur")
                                    }
                                }
                            },
                            {
                                id: "delete",
                                label: "Supprimer",
                                variant: "destructive",
                                onExecute: async (selected) => {
                                    await deleteItems(selected)
                                }
                            },
                        ]}
                    />

                    {detailsPost && (
                        <PostDetailsSheet
                            post={detailsPost}
                            opened={!!detailsPost}
                            onOpenChange={(open) => !open && setDetailsPost(null)}
                            onCollaborators={(p) => { setDetailsPost(null); setCollaboratorsPost(p) }}
                            onMedia={(p) => { setDetailsPost(null); setMediaPost(p) }}
                            onCommit={(p) => { setDetailsPost(null); setCommitPost(p) }}
                        />
                    )}

                    {collaboratorsPost && (
                        <PostCollaboratorsDialog
                            post={collaboratorsPost}
                            open={!!collaboratorsPost}
                            onOpenChange={(open) => { if (!open) setCollaboratorsPost(null) }}
                            onSuccess={() => { setCollaboratorsPost(null); invalidate() }}
                        />
                    )}

                    {mediaPost && (
                        <PostMediaDialog
                            post={mediaPost}
                            open={!!mediaPost}
                            onOpenChange={(open) => { if (!open) setMediaPost(null) }}
                            onSuccess={() => { setMediaPost(null); invalidate() }}
                        />
                    )}

                    {commitPost && (
                        <PostCommitDialog
                            post={commitPost}
                            open={!!commitPost}
                            onOpenChange={(open) => { if (!open) setCommitPost(null) }}
                            onSuccess={() => { setCommitPost(null); invalidate() }}
                        />
                    )}
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                    <Empty>
                        <EmptyMedia>
                            <FileTextIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Blog</EmptyTitle>
                        <EmptyDescription>Tous les articles s&apos;afficheront ici</EmptyDescription>
                        <EmptyContent>
                            <Button onClick={router.refresh} variant="outline">
                                Actualiser
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )}
        </div>
    )
}
