"use client"

import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {PosApiService} from "@/modules/pos-management/application/service/pos-api-service";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {OrderInterface, CreateOrderInterface} from "@/modules/pos-management/domain/order.interface";
import {CreateOrderItemInterface} from "@/modules/pos-management/domain/order-item.interface";
import {OrderStatusEnum} from "@/modules/pos-management/domain/enums/order-status.enum";
import {SaleTypeEnum} from "@/modules/pos-management/domain/enums/sale-type.enum";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {Badge} from "@/core/presentation/ui/badge";
import {Separator} from "@/core/presentation/ui/separator";
import {Input} from "@/core/presentation/ui/input";
import {
    PlusIcon,
    MinusIcon,
    TrashIcon,
    UtensilsIcon,
    ShoppingCartIcon,
    CheckCircle2Icon,
    XCircleIcon,
    ClockIcon,
    LayersIcon,
    UserIcon,
    SearchIcon,
    WineIcon,
    StoreIcon,
    ShoppingBagIcon,
    TruckIcon
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {toast} from "sonner";
import {Tabs, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";

export default function PosView() {
    const queryClient = useQueryClient();
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [saleType, setSaleType] = useState<SaleTypeEnum>(SaleTypeEnum.RETAIL);
    const [searchTerm, setSearchTerm] = useState<string>("");
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
        queryKey: ['pos-management', 'orders', 'active'],
        queryFn: async () => {
            const response = await PosApiService.getOrders();
            return response.data?.data || [];
        }
    });

    // Mutations
    const createOrderMutation = useMutation({
        mutationFn: (newOrder: CreateOrderInterface) => PosApiService.createOrder(newOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pos-management', 'orders']});
            setCart([]);
            setSelectedTable(null);
            setCustomerName("");
            toast.success("Commande créée avec succès");
        }
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({id, status}: { id: string, status: OrderStatusEnum }) => 
            PosApiService.updateOrder(id, {status}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pos-management', 'orders']});
            toast.success("Statut de la commande mis à jour");
        }
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id: string) => PosApiService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pos-management', 'orders']});
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
            
            // Simulation de prix selon le type de vente
            let price = 1000; // Base
            if (saleType === SaleTypeEnum.WHOLESALE) price = 800;
            else if (saleType === SaleTypeEnum.SEMI_WHOLESALE) price = 900;

            return [...prev, {
                productId: product.id!,
                quantity: 1,
                unitPrice: price
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

    const filteredProducts = products?.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const getSaleTypeLabel = (type: SaleTypeEnum) => {
        switch (type) {
            case SaleTypeEnum.WHOLESALE: return "Gros";
            case SaleTypeEnum.SEMI_WHOLESALE: return "Semi-gros";
            case SaleTypeEnum.RETAIL: return "Détail";
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 bg-muted/20 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Point de Vente</h1>
                    <p className="text-muted-foreground text-sm">Gestion des commandes de boissons et produits.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-background p-1 rounded-xl border">
                    <Tabs value={saleType} onValueChange={(v) => setSaleType(v as SaleTypeEnum)} className="w-auto">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value={SaleTypeEnum.RETAIL} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                <ShoppingBagIcon className="size-4"/>
                                Détail
                            </TabsTrigger>
                            <TabsTrigger value={SaleTypeEnum.SEMI_WHOLESALE} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                <StoreIcon className="size-4"/>
                                Semi-gros
                            </TabsTrigger>
                            <TabsTrigger value={SaleTypeEnum.WHOLESALE} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                <TruckIcon className="size-4"/>
                                Gros
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Side: Product Selection and Search */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    
                    {/* Customer & Table Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 border-none shadow-sm flex flex-col gap-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <UserIcon className="size-4 text-primary"/>
                                Client
                            </h3>
                            <Input 
                                placeholder="Nom du client (optionnel)" 
                                value={customerName} 
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="h-10 rounded-xl"
                            />
                        </Card>
                        <Card className="p-4 border-none shadow-sm flex flex-col gap-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <UtensilsIcon className="size-4 text-primary"/>
                                Table
                            </h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {tables.slice(0, 6).map(table => {
                                    const isSelected = selectedTable === table;
                                    return (
                                        <Button
                                            key={table}
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            className={cn("rounded-lg h-9 min-w-[80px]", isSelected && "bg-primary text-primary-foreground")}
                                            onClick={() => setSelectedTable(isSelected ? null : table)}
                                        >
                                            {table}
                                        </Button>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* Product Catalog */}
                    <Card className="p-6 border-none shadow-sm flex-auto flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <WineIcon className="size-5 text-primary"/>
                                Boissons & Produits
                            </h3>
                            <div className="relative w-full md:w-72">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                <Input 
                                    placeholder="Rechercher un produit..." 
                                    className="pl-9 h-10 rounded-xl bg-muted/50 border-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {isLoadingProducts ? (
                            <div className="flex-auto flex items-center justify-center p-12">
                                <WaitingActivity size={32}/>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredProducts?.map(product => (
                                    <div 
                                        key={product.id}
                                        className="group relative bg-background border border-border/50 rounded-2xl p-3 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer flex flex-col gap-2"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center mb-1 overflow-hidden">
                                            <WineIcon className="size-10 text-muted-foreground/30 group-hover:scale-110 transition-transform"/>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">{product.type}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-xs font-bold text-primary">
                                                {saleType === SaleTypeEnum.RETAIL ? '1000' : saleType === SaleTypeEnum.SEMI_WHOLESALE ? '900' : '800'} FCFA
                                            </span>
                                            <div className="bg-primary/10 text-primary p-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                                <PlusIcon className="size-3"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Side: Cart Summary */}
                <div className="flex flex-col gap-6">
                    <Card className="p-5 border-none shadow-sm flex flex-col h-full min-h-[600px] sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingCartIcon className="size-5 text-primary"/>
                                Panier
                            </h3>
                            {cart.length > 0 && (
                                <Button variant="ghost" size="icon-sm" onClick={() => setCart([])} className="text-destructive hover:bg-destructive/10">
                                    <TrashIcon className="size-4"/>
                                </Button>
                            )}
                        </div>

                        {selectedTable || customerName ? (
                            <div className="flex items-center gap-2 mb-4">
                                {selectedTable && <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{selectedTable}</Badge>}
                                {customerName && <Badge variant="outline" className="text-xs">{customerName}</Badge>}
                            </div>
                        ) : null}

                        <Separator className="mb-4 bg-border/50"/>

                        <div className="flex-auto overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-4">
                                    <div className="bg-muted p-4 rounded-full">
                                        <ShoppingCartIcon className="size-8 opacity-20"/>
                                    </div>
                                    <p className="text-sm font-medium">Le panier est vide</p>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const product = products?.find(p => p.id === item.productId);
                                    return (
                                        <div key={item.productId} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-xl border border-border/20">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{product?.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{item.unitPrice} FCFA / unité</span>
                                                </div>
                                                <span className="text-sm font-bold text-primary">{item.unitPrice * item.quantity} FCFA</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-3 bg-background border rounded-lg px-2 py-1">
                                                    <button 
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <MinusIcon className="size-3"/>
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => product && addToCart(product)}
                                                        className="text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        <PlusIcon className="size-3"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-auto pt-6 space-y-4">
                            <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Type de vente</span>
                                    <span className="font-semibold">{getSaleTypeLabel(saleType)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Sous-total</span>
                                    <span className="font-semibold">{cartTotal} FCFA</span>
                                </div>
                                <Separator className="my-2 bg-border/50"/>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="text-xl font-black text-primary">{cartTotal} FCFA</span>
                                </div>
                            </div>
                            
                            <Button 
                                className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20" 
                                disabled={cart.length === 0 || createOrderMutation.isPending}
                                onClick={() => {
                                    createOrderMutation.mutate({
                                        tableNumber: selectedTable || undefined,
                                        customerName: customerName || undefined,
                                        saleType: saleType,
                                        items: cart
                                    });
                                }}
                            >
                                {createOrderMutation.isPending ? <WaitingActivity size={20} /> : "Finaliser la vente"}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Active Orders Section */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <ClockIcon className="size-6 text-primary"/>
                        Ventes & Commandes Récentes
                    </h3>
                </div>
                
                {isLoadingOrders ? (
                    <div className="flex justify-center p-12"><WaitingActivity size={32}/></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {activeOrders?.filter(o => o.status !== OrderStatusEnum.CANCELLED).map(order => (
                            <Card key={order.id} className="p-4 border-none shadow-sm flex flex-col gap-4 group">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{order.tableNumber || order.customerName || "Vente directe"}</span>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 h-5 bg-muted/50 border-none text-muted-foreground">
                                                {getSaleTypeLabel(order.saleType)}
                                            </Badge>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-medium">{new Date(order.createdAt || '').toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-primary">{order.totalAmount} FCFA</span>
                                        <Badge className={cn(
                                            "capitalize gap-1 text-[10px] mt-1 h-5",
                                            order.status === OrderStatusEnum.PAID ? "bg-green-500/10 text-green-600 border-none" : ""
                                        )}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <Separator className="bg-border/30"/>

                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="text-xs flex justify-between">
                                            <span className="text-muted-foreground font-medium">{item.quantity}x {item.product?.name || 'Produit'}</span>
                                            <span className="font-semibold">{item.unitPrice * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 mt-auto pt-2">
                                    {order.status !== OrderStatusEnum.PAID && (
                                        <Button 
                                            size="sm" 
                                            className="flex-auto h-9 rounded-xl bg-primary shadow-sm"
                                            onClick={() => updateOrderStatusMutation.mutate({id: order.id!, status: OrderStatusEnum.PAID})}
                                        >
                                            Marquer Payé
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm" 
                                        className="text-muted-foreground hover:text-destructive h-9 w-9 rounded-xl hover:bg-destructive/10"
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
