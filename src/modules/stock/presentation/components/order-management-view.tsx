"use client"

import React, {useState, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {OrderInterface, CreateOrderInterface, UpdateOrderInterface} from "@/modules/stock/domain/order.interface";
import {OrderItemInterface, CreateOrderItemInterface} from "@/modules/stock/domain/order-item.interface";
import {OrderStatusEnum} from "@/modules/stock/domain/enums/order-status.enum";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {Badge} from "@/core/presentation/ui/badge";
import {Separator} from "@/core/presentation/ui/separator";
import {
    PlusIcon,
    MinusIcon,
    TrashIcon,
    UtensilsIcon,
    ShoppingCartIcon,
    CheckCircle2Icon,
    XCircleIcon,
    ClockIcon,
    ChevronRightIcon, LayersIcon
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {ScrollArea} from "@radix-ui/react-scroll-area";
import {toast} from "sonner";

export function OrderManagementView() {
    const queryClient = useQueryClient();
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [cart, setCart] = useState<CreateOrderItemInterface[]>([]);

    // Queries
    const {data: products, isLoading: isLoadingProducts} = useQuery<ProductInterface[]>({
        queryKey: ['stock', 'products', 'sales'],
        queryFn: async () => {
            const response = await StockApiService.getAll();
            return response.data?.data || [];
        }
    });

    const {data: activeOrders, isLoading: isLoadingOrders} = useQuery<OrderInterface[]>({
        queryKey: ['stock', 'orders', 'active'],
        queryFn: async () => {
            const response = await StockApiService.getOrders();
            return response.data?.data || [];
        }
    });

    // Mutations
    const createOrderMutation = useMutation({
        mutationFn: (newOrder: CreateOrderInterface) => StockApiService.createOrder(newOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['stock', 'orders']});
            setCart([]);
            setSelectedTable(null);
            toast.success("Commande créée avec succès");
        }
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({id, status}: { id: string, status: OrderStatusEnum }) => 
            StockApiService.updateOrder(id, {status}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['stock', 'orders']});
            toast.success("Statut de la commande mis à jour");
        }
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id: string) => StockApiService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['stock', 'orders']});
            toast.success("Commande supprimée");
        }
    });

    // Logic
    const addToCart = (product: ProductInterface) => {
        if (!product.id) return;
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item => 
                    item.productId === product.id 
                    ? {...item, quantity: item.quantity + 1} 
                    : item
                );
            }
            return [...prev, {
                productId: product.id!,
                quantity: 1,
                unitPrice: 0 // In a real app, products would have prices
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item => 
                    item.productId === productId 
                    ? {...item, quantity: item.quantity - 1} 
                    : item
                );
            }
            return prev.filter(item => item.productId !== productId);
        });
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const tables = Array.from({length: 12}, (_, i) => `Table ${i + 1}`);

    const getStatusIcon = (status: OrderStatusEnum) => {
        switch (status) {
            case OrderStatusEnum.PENDING: return <ClockIcon className="size-3"/>;
            case OrderStatusEnum.PREPARING: return <WaitingActivity size={12}/>;
            case OrderStatusEnum.READY: return <CheckCircle2Icon className="size-3"/>;
            case OrderStatusEnum.PAID: return <CheckCircle2Icon className="size-3 text-green-500"/>;
            case OrderStatusEnum.CANCELLED: return <XCircleIcon className="size-3 text-red-500"/>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Table Selection & Active Orders */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <UtensilsIcon className="size-5 text-primary"/>
                            Sélection de la Table
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {tables.map(table => {
                                const isActive = activeOrders?.some(o => o.tableNumber === table && o.status !== OrderStatusEnum.PAID && o.status !== OrderStatusEnum.CANCELLED);
                                const isSelected = selectedTable === table;
                                return (
                                    <Button
                                        key={table}
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            "h-16 flex flex-col gap-1 rounded-xl",
                                            isActive && !isSelected && "border-primary/50 bg-primary/5 text-primary"
                                        )}
                                        onClick={() => setSelectedTable(table)}
                                    >
                                        <span className="text-xs font-bold">{table}</span>
                                        {isActive && <Badge variant="secondary" className="text-[10px] h-4 px-1">Active</Badge>}
                                    </Button>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-4 flex-auto">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <LayersIcon className="size-5 text-primary"/>
                            Produits disponibles
                        </h3>
                        {isLoadingProducts ? (
                            <div className="flex justify-center p-8"><WaitingActivity/></div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {products?.map(product => (
                                    <Button
                                        key={product.id}
                                        variant="outline"
                                        className="h-auto py-4 flex flex-col items-start gap-1 text-left rounded-xl hover:border-primary/50 transition-colors"
                                        onClick={() => addToCart(product)}
                                    >
                                        <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">{product.type}</span>
                                        <div className="flex items-center justify-between w-full mt-2">
                                            <span className="text-xs font-bold text-primary">0 FCFA</span>
                                            <PlusIcon className="size-3 text-primary"/>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Current Cart / Order Summary */}
                <div className="flex flex-col gap-6">
                    <Card className="p-4 flex flex-col h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ShoppingCartIcon className="size-5 text-primary"/>
                                {selectedTable ? `Commande : ${selectedTable}` : "Nouvelle commande"}
                            </h3>
                            {cart.length > 0 && (
                                <Button variant="ghost" size="icon-sm" onClick={() => setCart([])}>
                                    <TrashIcon className="size-4 text-destructive"/>
                                </Button>
                            )}
                        </div>

                        <Separator className="mb-4"/>

                        <div className="flex-auto overflow-y-auto space-y-4 pr-2">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                                    <ShoppingCartIcon className="size-8 opacity-20"/>
                                    <p className="text-sm">Le panier est vide</p>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const product = products?.find(p => p.id === item.productId);
                                    return (
                                        <div key={item.productId} className="flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{product?.name}</span>
                                                <span className="text-xs text-muted-foreground">{item.unitPrice} x {item.quantity}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon-xs" 
                                                    className="h-6 w-6"
                                                    onClick={() => removeFromCart(item.productId)}
                                                >
                                                    <MinusIcon className="size-3"/>
                                                </Button>
                                                <span className="text-xs font-bold min-w-[20px] text-center">{item.quantity}</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon-xs" 
                                                    className="h-6 w-6"
                                                    onClick={() => product && addToCart(product)}
                                                >
                                                    <PlusIcon className="size-3"/>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-auto pt-4 space-y-4">
                            <Separator/>
                            <div className="flex items-center justify-between font-bold">
                                <span>Total</span>
                                <span className="text-primary">{cartTotal} FCFA</span>
                            </div>
                            <Button 
                                className="w-full rounded-xl" 
                                disabled={cart.length === 0 || !selectedTable || createOrderMutation.isPending}
                                onClick={() => {
                                    if (selectedTable) {
                                        createOrderMutation.mutate({
                                            tableNumber: selectedTable,
                                            items: cart
                                        });
                                    }
                                }}
                            >
                                {createOrderMutation.isPending ? <WaitingActivity size={16}/> : "Valider la commande"}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Active Orders Section */}
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ClockIcon className="size-6 text-primary"/>
                    Commandes en cours
                </h3>
                {isLoadingOrders ? (
                    <div className="flex justify-center p-8"><WaitingActivity/></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeOrders?.filter(o => o.status !== OrderStatusEnum.PAID && o.status !== OrderStatusEnum.CANCELLED).map(order => (
                            <Card key={order.id} className="p-4 border-l-4 border-l-primary flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{order.tableNumber}</span>
                                        <Badge className="capitalize gap-1">
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <span className="text-sm font-bold text-primary">{order.totalAmount} FCFA</span>
                                </div>
                                
                                <div className="space-y-1">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="text-xs flex justify-between">
                                            <span>{item.quantity}x {item.product?.name || 'Produit'}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 mt-2">
                                    {order.status === OrderStatusEnum.PENDING && (
                                        <Button 
                                            size="sm" 
                                            className="flex-auto h-8"
                                            onClick={() => updateOrderStatusMutation.mutate({id: order.id!, status: OrderStatusEnum.PREPARING})}
                                        >
                                            Préparer
                                        </Button>
                                    )}
                                    {order.status === OrderStatusEnum.PREPARING && (
                                        <Button 
                                            size="sm" 
                                            className="flex-auto h-8 bg-orange-500 hover:bg-orange-600"
                                            onClick={() => updateOrderStatusMutation.mutate({id: order.id!, status: OrderStatusEnum.READY})}
                                        >
                                            Prêt
                                        </Button>
                                    )}
                                    {order.status === OrderStatusEnum.READY && (
                                        <Button 
                                            size="sm" 
                                            className="flex-auto h-8 bg-green-500 hover:bg-green-600"
                                            onClick={() => updateOrderStatusMutation.mutate({id: order.id!, status: OrderStatusEnum.PAID})}
                                        >
                                            Payer
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm" 
                                        className="text-destructive h-8 w-8"
                                        onClick={() => order.id && deleteOrderMutation.mutate(order.id)}
                                    >
                                        <TrashIcon className="size-4"/>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
