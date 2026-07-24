"use client"

import {DataGrid} from "@/core/presentation/data-grid";
import {usersDataGridColumns} from "@/modules/users/presentation/components/users-columns";
import {useQuery} from "@tanstack/react-query";
import {UsersApiService} from "@/modules/users/application/service/users-api-service";
import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {AppConfig} from "@/core/domain/config/app.config";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {LayersIcon, UsersIcon} from "lucide-react";
import {Waiting} from "@/core/presentation/waiting";
import {Button} from "@/core/presentation/ui/button";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store";
import {Fragment} from "react";


export function UsersDataGrid() {
    const {getCurrentUser} = authUserConnectedStore()
    const router = useRouter()
    const getUsers: () => Promise<UserInterface[]> = async () => {
        const responses = await UsersApiService.getAll();
        return responses.data.data;
    }
    const {data, isLoading} = useQuery<UserInterface[]>({
        queryKey: ['users', 'activities', 'table'],
        enabled: !!getCurrentUser,
        queryFn: getUsers,
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const deleteItems = async (selected: UserInterface[]) => {
        try {
            await UsersApiService.deleteMany(selected.map(s => s.id))
            toast.success("Les utilisateurs ont été supprimés avec succès")
        } catch (error: any) {
        }
    }

    return (
        <div className="flex-auto">
            {data?.length ? (
                <Fragment>
                    {isLoading && (
                        <div className="flex-auto flex flex-col items-center justify-center">
                            <Waiting label={"Chargement de utilisateurs"}/>
                        </div>
                    )}
                    {!isLoading && (
                        <DataGrid
                            data={data as UserInterface[]}
                            columns={usersDataGridColumns}
                            getRowId={row => row.id}
                            enableSelection
                            enableBulkActions
                            bulkActions={[
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
                    )}
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                    <Empty>
                        <EmptyMedia>
                            <UsersIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Utilisateurs</EmptyTitle>
                        <EmptyDescription>Tous les utilisateurs s'afficheront ici</EmptyDescription>
                        {isLoading && (<EmptyDescription>
                            <Waiting label={"En attente de utilisateurs"}/>
                        </EmptyDescription>)}
                        <EmptyContent>
                            <Button
                                onClick={router.refresh}
                                variant="outline">
                                Actualiser
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )}
        </div>
    )
}