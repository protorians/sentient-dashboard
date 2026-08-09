"use client"

import React, {useState} from "react";
import {OrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {Badge} from "@/core/presentation/ui/badge";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid";
import {OrderEditDialog} from "@/modules/beverage-sales/presentation/components/order-edit-dialog";
import {
    ClockIcon,
    CheckCircle2Icon,
    XCircleIcon,
    PencilIcon,
    WineIcon,
    GiftIcon,
    ReceiptTextIcon,
    UserIcon,
    UtensilsIcon,
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import {Empty, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";

interface RecentOrdersProps {
    orders?: OrderInterface[];
    isLoading?: boolean;
    products?: ProductInterface[];
    bundles?: BundleInterface[];
    isSaving?: boolean;
    onMarkPaid: (id: string) => void;
    onCancel: (id: string) => void;
    onDelete: (id: string) => void;
    onSaveOrder: (order: OrderInterface, payload: UpdateOrderInterface) => void;
}

const getOrderTypeLabel = (type: OrderTypeEnum) => {
    switch (type) {
        case OrderTypeEnum.GROS: return 'Gros';
        case OrderTypeEnum.SEMI_GROS: return 'Semi-gros';
        case OrderTypeEnum.DETAIL: return 'Détail';
    }
};

const StatusBadge = ({status}: { status: OrderStatusEnum }) => {
    if (status === OrderStatusEnum.PAID) {
        return <Badge className="capitalize gap-1 text-[10px] bg-green-500/10 text-green-600 border-none">
            <CheckCircle2Icon className="size-3"/>Payée
        </Badge>;
    }
    if (status === OrderStatusEnum.CANCELLED) {
        return <Badge className="capitalize gap-1 text-[10px] bg-red-500/10 text-red-500 border-none">
            <XCircleIcon className="size-3"/>Annulée
        </Badge>;
    }
    return <Badge className="capitalize gap-1 text-[10px] bg-amber-500/10 text-amber-600 border-none">
        <ClockIcon className="size-3"/>En attente
    </Badge>;
};

export function RecentOrders({orders, isLoading, products, bundles, isSaving, onMarkPaid, onCancel, onDelete, onSaveOrder}: RecentOrdersProps) {
    const [editing, setEditing] = useState<OrderInterface | null>(null);
    const activeOrders = (orders ?? []).filter(o => o.status !== OrderStatusEnum.CANCELLED);

    const columns = [
        {
            accessorKey: "orderNumber",
            header: "Commande",
            cell: ({row}: any) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold whitespace-nowrap">{row.original.orderNumber}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 h-5 bg-muted/50 border-none text-muted-foreground">
                        {getOrderTypeLabel(row.original.orderType)}
                    </Badge>
                </div>
            ),
        },
        {
            id: "date",
            header: "Date",
            cell: ({row}: any) => {
                const order = row.original as OrderInterface;
                const reference = order.paidAt ?? order.createdAt;
                const isPaid = order.status === OrderStatusEnum.PAID;
                return (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {reference ? new Date(reference).toLocaleString('fr-FR') : ''}
                        {isPaid && order.paidAt && <span className="ml-1 text-green-600">· payée</span>}
                    </span>
                );
            },
        },
        {
            id: "assignee",
            header: "Client / Table",
            cell: ({row}: any) => (
                <div className="flex items-center gap-2 text-sm">
                    {row.original.customerId ? (
                        <>
                            <UserIcon className="size-3.5 text-muted-foreground"/>
                            <span>Client #{row.original.customerId.slice(0, 8)}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                    {row.original.tableId && (
                        <Badge variant="outline" className="text-[10px] bg-muted/50 border-none text-muted-foreground">
                            <UtensilsIcon className="size-3"/> Table
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            id: "lines",
            header: "Détail",
            cell: ({row}: any) => {
                const order = row.original as OrderInterface;
                const items = order.items.map(item => ({key: `i-${item.id}`, icon: <WineIcon className="size-3 opacity-60"/>, label: `${item.quantity}× ${item.productName}`}));
                const bundleItems = order.bundles.map(bundle => ({key: `b-${bundle.id}`, icon: <GiftIcon className="size-3 opacity-60"/>, label: `${bundle.quantity}× ${bundle.bundleName}`}));
                const all = [...items, ...bundleItems];
                return (
                    <div className="flex flex-col gap-0.5 max-w-72">
                        {all.map(line => (
                            <span key={line.key} className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                {line.icon}{line.label}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "netAmount",
            header: "Total",
            cell: ({row}: any) => (
                <span className="font-black text-primary whitespace-nowrap">{formatPrice(row.original.netAmount)}</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({row}: any) => <StatusBadge status={row.original.status}/>,
        },
    ];

    const rowActions = (order: OrderInterface): RowAction<OrderInterface>[] => {
        if (order.status !== OrderStatusEnum.PENDING) return [];
        return [
            {
                id: "edit",
                label: "Modifier",
                icon: <PencilIcon className="size-4"/>,
                onExecute: (o) => setEditing(o),
            },
            {
                id: "mark-paid",
                label: "Marquer payé",
                icon: <CheckCircle2Icon className="size-4"/>,
                onExecute: (o) => onMarkPaid(o.id),
            },
            {
                id: "cancel",
                label: "Annuler",
                icon: <XCircleIcon className="size-4"/>,
                variant: "destructive",
                onExecute: (o) => onCancel(o.id),
            },
        ];
    };

    return (
        <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                    <ReceiptTextIcon className="size-5 text-primary"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold">Ventes & Commandes Récentes</h3>
                    <p className="text-xs text-muted-foreground">
                        Les commandes en attente (non payées) peuvent être modifiées.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><WaitingActivity size={32}/></div>
            ) : activeOrders.length === 0 ? (
                <Card className="p-8 border-none shadow-sm flex items-center justify-center">
                    <Empty>
                        <EmptyMedia>
                            <ReceiptTextIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Ventes & Commandes</EmptyTitle>
                        <EmptyDescription>Aucune vente enregistrée pour le dépôt</EmptyDescription>
                    </Empty>
                </Card>
            ) : (
                <DataGrid
                    data={activeOrders}
                    columns={columns as any}
                    getRowId={row => row.id}
                    actions={rowActions}
                    initialPageSize={10}
                />
            )}

            <OrderEditDialog
                order={editing}
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                products={products}
                bundles={bundles}
                isSaving={isSaving}
                onSave={(order, payload) => onSaveOrder(order, payload)}
            />
        </div>
    );
}
