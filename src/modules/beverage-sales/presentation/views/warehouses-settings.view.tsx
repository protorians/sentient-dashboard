"use client"

import React, {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {createColumnHelper, type ColumnDef} from "@tanstack/react-table";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";
import {AnimatedContent} from "@/core/presentation/animated-content";
import {
    WarehouseFormDialog,
    WarehouseFormData
} from "@/modules/beverage-sales/presentation/components/warehouse-form-dialog";
import {useSettingsMutations} from "@/modules/beverage-sales/presentation/hooks/use-settings-mutations";
import {Button} from "@/core/presentation/ui/button";
import {Badge} from "@/core/presentation/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {DataGrid, type RowAction} from "@/core/presentation/data-grid/data-grid";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/core/presentation/ui/alert-dialog";
import {PencilIcon, PlusIcon, TrashIcon, WarehouseIcon} from "lucide-react";

const columnHelper = createColumnHelper<WarehouseInterface>();

const columns: ColumnDef<WarehouseInterface, any>[] = [
    columnHelper.accessor("name", {
        header: "Nom",
        cell: ({row}) => (
            <div className="flex items-center gap-2">
                <WarehouseIcon className="size-3.5 text-muted-foreground"/>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    }),
    columnHelper.accessor("address", {
        header: "Adresse",
        cell: ({getValue}) => (
            <span className="text-muted-foreground">{getValue() || "—"}</span>
        ),
    }),
    columnHelper.display({
        id: "status",
        header: "Statut",
        cell: ({row}) => (
            <Badge variant={row.original.status ? "default" : "secondary"}>
                {row.original.status ? "Actif" : "Inactif"}
            </Badge>
        ),
    }),
    columnHelper.accessor("createdAt", {
        header: "Créé le",
        cell: ({getValue}) => (
            <span className="text-muted-foreground">
                {new Date(getValue()).toLocaleDateString('fr-FR')}
            </span>
        ),
    }),
];

export default function WarehousesSettingsView() {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<WarehouseInterface | null>(null);
    const [deleting, setDeleting] = useState<WarehouseInterface | null>(null);

    const {data: warehouses, isLoading} = useQuery<WarehouseInterface[]>({
        queryKey: ['stock', 'warehouses'],
        queryFn: async () => {
            const response = await StockApiService.getWarehouses();
            return response.data?.data || [];
        }
    });

    const depots = useMemo(() => {
        return (warehouses ?? []).filter(w => w.type === WarehouseTypeEnum.BEVERAGE_DEPOT);
    }, [warehouses]);

    const {
        createWarehouseMutation,
        updateWarehouseMutation,
        deleteWarehouseMutation,
    } = useSettingsMutations();

    const handleSave = async (data: WarehouseFormData) => {
        if (editing) {
            await updateWarehouseMutation.mutateAsync({
                id: editing.id,
                payload: {
                    name: data.name,
                    address: data.address,
                    type: WarehouseTypeEnum.BEVERAGE_DEPOT,
                    status: data.status
                },
            });
        } else {
            await createWarehouseMutation.mutateAsync({
                name: data.name,
                address: data.address,
                type: WarehouseTypeEnum.BEVERAGE_DEPOT,
            });
        }
        setFormOpen(false);
        setEditing(null);
    };

    const handleDelete = async () => {
        if (!deleting) return;
        await deleteWarehouseMutation.mutateAsync(deleting.id);
        setDeleting(null);
    };

    const rowActions = (warehouse: WarehouseInterface): RowAction<WarehouseInterface>[] => [
        {
            id: "edit",
            label: "Modifier",
            icon: <PencilIcon/>,
            onExecute: () => {
                setEditing(warehouse);
                setFormOpen(true);
            },
        },
        {
            id: "delete",
            label: "Supprimer",
            icon: <TrashIcon/>,
            variant: "destructive",
            onExecute: () => setDeleting(warehouse),
        },
    ];

    return (
        <SettingsLayout.Section>
            <AnimatedContent variant="enter">
            <SettingsLayout.Header
                title="Dépôts"
                description="Gérez les entrepôts de type BEVERAGE_DEPOT utilisés par la caisse."
                actions={
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                    >
                        <PlusIcon/>
                        Ajouter un dépôt
                    </Button>
                }
            />

            <div className="">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <WaitingActivity size={28}/>
                    </div>
                ) : depots.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <WarehouseIcon/>
                            </EmptyMedia>
                            <EmptyTitle>Aucun dépôt</EmptyTitle>
                            <EmptyDescription>
                                Créez un dépôt de type BEVERAGE_DEPOT pour utiliser la caisse de vente de boissons.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <DataGrid
                        data={depots}
                        columns={columns}
                        getRowId={(w) => w.id}
                        actions={rowActions}
                        enablePagination={false}
                        enableColumnVisibility={false}
                    />
                )}
            </div>

            <WarehouseFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                warehouse={editing}
                onSave={handleSave}
                isSaving={createWarehouseMutation.isPending || updateWarehouseMutation.isPending}
            />

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le dépôt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous vraiment supprimer le dépôt « {deleting?.name} » ? Cette action est
                            irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteWarehouseMutation.isPending}
                        >
                            {deleteWarehouseMutation.isPending ? <WaitingActivity size={16}/> : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </AnimatedContent>
        </SettingsLayout.Section>
    );
}
