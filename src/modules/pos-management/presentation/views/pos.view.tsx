"use client"

import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {PosApiService} from "@/modules/pos-management/application/service/pos-api-service";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {OrderInterface, CreateOrderInterface} from "@/modules/pos-management/domain/order.interface";
import {OrderStatusEnum} from "@/modules/pos-management/domain/enums/order-status.enum";
import {PosOrderTypeEnum} from "@/modules/pos-management/domain/enums/sale-type.enum";
import {WarehouseTypeEnum} from "@/modules/pos-management/domain/enums/warehouse-type.enum";
import {MovementUnitEnum} from "@/modules/stock/domain/stock-movement.interface";
import {PosTableInterface} from "@/modules/pos-management/domain/pos-table.interface";
import {CustomerInterface} from "@/modules/pos-management/domain/customer.interface";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {Badge} from "@/core/presentation/ui/badge";
import {Separator} from "@/core/presentation/ui/separator";
import {Input} from "@/core/presentation/ui/input";
import {
    PlusIcon,
    MinusIcon,
    TrashIcon,
    ShoppingCartIcon,
    CheckCircle2Icon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    SearchIcon,
    WineIcon,
    StoreIcon,
    ShoppingBagIcon,
    TruckIcon,
    BanknoteIcon,
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {toast} from "sonner";
import {Tabs, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {AnimatedContent} from "@/core/presentation/animated-content";

interface CartItem {
    productId: string;
    productName: string;
    quantity: number;
    unit: MovementUnitEnum;
    unitPrice: number;
    productSalePrice: number;
    productPackPrice?: number | null;
    productCasePrice?: number | null;
    unitsPerPack?: number | null;
    unitsPerCase?: number | null;
}

export default function PosView() {
    const queryClient = useQueryClient();
    const [warehouseType, setWarehouseType] = useState<WarehouseTypeEnum>(WarehouseTypeEnum.PHARMACY);
    const [orderType, setOrderType] = useState<PosOrderTypeEnum>(PosOrderTypeEnum.DETAIL);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterface | null>(null);
    const [customerSearch, setCustomerSearch] = useState<string>("");
    const [customerName, setCustomerName] = useState<string>("");
    const [selectedTable, setSelectedTable] = useState<PosTableInterface | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [receivedAmount, setReceivedAmount] = useState<number>(0);
    const [showCustomerResults, setShowCustomerResults] = useState(false);

    const {data: warehouses} = useQuery({
        queryKey: ['stock', 'warehouses'],
        queryFn: async () => {
            const response = await StockApiService.getWarehouses();
            return response.data?.data || [];
        }
    });

    const {data: posProducts, isLoading: isLoadingProducts} = useQuery<ProductInterface[]>({
        queryKey: ['pos', 'products', warehouseType],
        queryFn: async () => {
            const response = await PosApiService.getPosProducts();
            return response.data?.data || [];
        }
    });

    const {data: posTables} = useQuery<PosTableInterface[]>({
        queryKey: ['pos', 'tables', warehouseType],
        queryFn: async () => {
            const response = await PosApiService.getPosTables();
            return response.data?.data || [];
        }
    });

    const {data: customerResults} = useQuery<CustomerInterface[]>({
        queryKey: ['pos', 'customers', customerSearch],
        queryFn: async () => {
            if (!customerSearch || customerSearch.length < 2) return [];
            const response = await PosApiService.searchCustomers(customerSearch);
            return response.data?.data || [];
        },
        enabled: customerSearch.length >= 2,
    });

    const {data: activeOrders, isLoading: isLoadingOrders} = useQuery<OrderInterface[]>({
        queryKey: ['pos-management', 'orders', 'active'],
        queryFn: async () => {
            const response = await PosApiService.getOrders({warehouseType});
            return response.data?.data || [];
        }
    });

    const createOrderMutation = useMutation({
        mutationFn: (newOrder: CreateOrderInterface) => PosApiService.createOrder(newOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pos-management', 'orders']});
            queryClient.invalidateQueries({queryKey: ['pos', 'products']});
            queryClient.invalidateQueries({queryKey: ['stock', 'products']});
            setCart([]);
            setSelectedTable(null);
            setSelectedCustomer(null);
            setCustomerName("");
            setCustomerSearch("");
            setReceivedAmount(0);
            toast.success("Commande créée avec succès");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Erreur lors de la création de la commande");
        }
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({id, status}: { id: string, status: OrderStatusEnum }) =>
            PosApiService.updateOrderStatus(id, {status}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pos-management', 'orders']});
            queryClient.invalidateQueries({queryKey: ['pos', 'products']});
            queryClient.invalidateQueries({queryKey: ['stock', 'products']});
            toast.success("Statut de la commande mis à jour");
        }
    });

    const getUnitPrice = (product: ProductInterface, unit: MovementUnitEnum): number => {
        switch (unit) {
            case MovementUnitEnum.PACK:
                if (product.packPrice && product.unitsPerPack) return product.packPrice / product.unitsPerPack;
                break;
            case MovementUnitEnum.CASE:
                if (product.casePrice && product.unitsPerCase) return product.casePrice / product.unitsPerCase;
                break;
        }
        return product.salePrice ?? 0;
    };

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

            const unit = MovementUnitEnum.UNIT;
            const unitPrice = getUnitPrice(product, unit);

            return [...prev, {
                productId: product.id!,
                productName: product.name,
                quantity: 1,
                unit,
                unitPrice,
                productSalePrice: product.salePrice ?? 0,
                productPackPrice: product.packPrice,
                productCasePrice: product.casePrice,
                unitsPerPack: product.unitsPerPack,
                unitsPerCase: product.unitsPerCase,
            }];
        });
    };

    const updateCartItemUnit = (productId: string, unit: MovementUnitEnum) => {
        setCart(prev => prev.map(item => {
            if (item.productId !== productId) return item;
            const product = posProducts?.find(p => p.id === productId);
            const newPrice = product ? getUnitPrice(product, unit) : item.unitPrice;
            return {...item, unit, unitPrice: newPrice};
        }));
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
    const netAmount = cartTotal;
    const changeAmount = receivedAmount > 0 ? Math.max(0, receivedAmount - netAmount) : 0;

    const filteredProducts = posProducts?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusIcon = (status: OrderStatusEnum) => {
        switch (status) {
            case OrderStatusEnum.PENDING: return <ClockIcon className="size-3"/>;
            case OrderStatusEnum.PAID: return <CheckCircle2Icon className="size-3 text-green-500"/>;
            case OrderStatusEnum.CANCELLED: return <XCircleIcon className="size-3 text-red-500"/>;
            default: return null;
        }
    };

    const getOrderTypeLabel = (type: PosOrderTypeEnum) => {
        switch (type) {
            case PosOrderTypeEnum.GROS: return "Gros";
            case PosOrderTypeEnum.SEMI_GROS: return "Semi-gros";
            case PosOrderTypeEnum.DETAIL: return "Détail";
        }
    };

    const getWarehouseTypeLabel = (type: WarehouseTypeEnum) => {
        switch (type) {
            case WarehouseTypeEnum.PHARMACY: return "Pharmacie";
            case WarehouseTypeEnum.RESTAURANT: return "Restaurant";
            case WarehouseTypeEnum.DEPOT: return "Dépôt";
        }
    };

    const getUnitLabel = (unit: MovementUnitEnum) => {
        switch (unit) {
            case MovementUnitEnum.UNIT: return "Unité";
            case MovementUnitEnum.PACK: return "Pack";
            case MovementUnitEnum.CASE: return "Casier";
        }
    };

    const selectCustomer = (customer: CustomerInterface) => {
        setSelectedCustomer(customer);
        setCustomerName([customer.firstname, customer.lastname].filter(Boolean).join(' '));
        setCustomerSearch("");
        setShowCustomerResults(false);
    };

    return (
        <AnimatedContent variant="enter">
            <div className="flex flex-col gap-6 p-4 md:p-6 bg-muted/20 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Point de Vente</h1>
                    <p className="text-muted-foreground text-sm">Gestion des commandes de boissons et produits.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-background p-1 rounded-xl border">
                        <Tabs value={warehouseType} onValueChange={(v) => setWarehouseType(v as WarehouseTypeEnum)} className="w-auto">
                            <TabsList className="bg-transparent border-none">
                                <TabsTrigger value={WarehouseTypeEnum.PHARMACY} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                    <StoreIcon className="size-4"/>
                                    Pharmacie
                                </TabsTrigger>
                                <TabsTrigger value={WarehouseTypeEnum.RESTAURANT} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                    <ShoppingBagIcon className="size-4"/>
                                    Restaurant
                                </TabsTrigger>
                                <TabsTrigger value={WarehouseTypeEnum.DEPOT} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                    <TruckIcon className="size-4"/>
                                    Dépôt
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex items-center gap-2 bg-background p-1 rounded-xl border">
                        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as PosOrderTypeEnum)} className="w-auto">
                            <TabsList className="bg-transparent border-none">
                                <TabsTrigger value={PosOrderTypeEnum.DETAIL} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                    Détail
                                </TabsTrigger>
                                <TabsTrigger value={PosOrderTypeEnum.SEMI_GROS} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                    Semi-gros
                                </TabsTrigger>
                                <TabsTrigger value={PosOrderTypeEnum.GROS} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                                    Gros
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Side: Product Selection */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* Customer & Table Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 border-none shadow-sm flex flex-col gap-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <UserIcon className="size-4 text-primary"/>
                                Client
                            </h3>
                            {selectedCustomer ? (
                                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                                    <span className="text-sm font-medium">{customerName}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => { setSelectedCustomer(null); setCustomerName(""); }}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <XCircleIcon className="size-4"/>
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        placeholder="Rechercher un client par nom..."
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowCustomerResults(true);
                                        }}
                                        onFocus={() => setShowCustomerResults(true)}
                                        onBlur={() => setTimeout(() => setShowCustomerResults(false), 200)}
                                        className="h-10 rounded-xl"
                                    />
                                    {showCustomerResults && customerResults && customerResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                            {customerResults.map(customer => (
                                                <div
                                                    key={customer.id}
                                                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                                                    onClick={() => selectCustomer(customer)}
                                                >
                                                    {[customer.firstname, customer.lastname].filter(Boolean).join(' ')}
                                                    {customer.companyName && ` (${customer.companyName})`}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <Input
                                placeholder="Ou nom du client de passage..."
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="h-10 rounded-xl"
                                disabled={!!selectedCustomer}
                            />
                        </Card>
                        <Card className="p-4 border-none shadow-sm flex flex-col gap-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <ShoppingBagIcon className="size-4 text-primary"/>
                                Table
                            </h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {(posTables || []).slice(0, 8).map(table => {
                                    const isSelected = selectedTable?.id === table.id;
                                    return (
                                        <Button
                                            key={table.id}
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            className={cn("rounded-lg h-9 min-w-[80px]", isSelected && "bg-primary text-primary-foreground")}
                                            onClick={() => setSelectedTable(isSelected ? null : table)}
                                        >
                                            {table.label}
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
                                Produits — {getWarehouseTypeLabel(warehouseType)}
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
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-primary">
                                                    {product.salePrice || 0} FCFA
                                                </span>
                                                {product.stockQuantity !== undefined && (
                                                    <span className={cn(
                                                        "text-[10px]",
                                                        product.stockQuantity > 10 ? "text-muted-foreground" : "text-amber-600"
                                                    )}>
                                                        Stock: {product.stockQuantity}
                                                    </span>
                                                )}
                                            </div>
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
                                {selectedTable && <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{selectedTable.label}</Badge>}
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
                                    const total = item.unitPrice * item.quantity;
                                    return (
                                        <div key={item.productId} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-xl border border-border/20">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{item.productName}</span>
                                                    <span className="text-[10px] text-muted-foreground">{item.unitPrice} FCFA / {getUnitLabel(item.unit)}</span>
                                                </div>
                                                <span className="text-sm font-bold text-primary">{total} FCFA</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1 gap-2">
                                                <div className="flex items-center gap-3 bg-background border rounded-lg px-2 py-1">
                                                    <button
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <MinusIcon className="size-3"/>
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(posProducts?.find(p => p.id === item.productId)!)}
                                                        className="text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        <PlusIcon className="size-3"/>
                                                    </button>
                                                </div>
                                                <select
                                                    value={item.unit}
                                                    onChange={(e) => updateCartItemUnit(item.productId, e.target.value as MovementUnitEnum)}
                                                    className="text-[10px] bg-background border rounded-md px-1.5 py-1"
                                                >
                                                    <option value={MovementUnitEnum.UNIT}>Unité</option>
                                                    {item.unitsPerPack && <option value={MovementUnitEnum.PACK}>Pack</option>}
                                                    {item.unitsPerCase && <option value={MovementUnitEnum.CASE}>Casier</option>}
                                                </select>
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
                                    <span className="font-semibold">{getOrderTypeLabel(orderType)}</span>
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

                                <div className="flex items-center gap-3 pt-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-muted-foreground">Montant reçu</label>
                                        <div className="relative">
                                            <BanknoteIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={receivedAmount || ''}
                                                onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
                                                className="pl-9 h-10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    {receivedAmount > 0 && (
                                        <div className="flex-1">
                                            <label className="text-xs text-muted-foreground">Monnaie</label>
                                            <div className={cn(
                                                "h-10 rounded-xl border px-3 flex items-center text-sm font-bold",
                                                changeAmount >= 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                                            )}>
                                                {changeAmount} FCFA
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
                                disabled={cart.length === 0 || createOrderMutation.isPending}
                                onClick={() => {
                                    createOrderMutation.mutate({
                                        warehouseType,
                                        orderType,
                                        customerId: selectedCustomer?.id,
                                        tableId: selectedTable?.id,
                                        customer: (!selectedCustomer && customerName.trim()) ? {name: customerName.trim()} : undefined,
                                        items: cart.map(item => ({
                                            productId: item.productId,
                                            quantity: item.quantity,
                                            unit: item.unit,
                                            unitPrice: item.unitPrice,
                                        })),
                                        receivedAmount: receivedAmount > 0 ? receivedAmount : undefined,
                                    });
                                }}
                            >
                                {createOrderMutation.isPending ? <WaitingActivity size={20}/> : "Finaliser la vente"}
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
                        Ventes & Commandes — {getWarehouseTypeLabel(warehouseType)}
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
                                            <span className="font-bold text-xs text-muted-foreground">{order.orderNumber}</span>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 h-5 bg-muted/50 border-none text-muted-foreground">
                                                {getOrderTypeLabel(order.orderType)}
                                            </Badge>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-primary">{order.netAmount} FCFA</span>
                                        <Badge className={cn(
                                            "capitalize gap-1 text-[10px] mt-1 h-5",
                                            order.status === OrderStatusEnum.PAID ? "bg-green-500/10 text-green-600 border-none" : ""
                                        )}>
                                            {getStatusIcon(order.status)}
                                            {order.status === OrderStatusEnum.PAID ? 'Payé' : order.status === OrderStatusEnum.PENDING ? 'En attente' : order.status}
                                        </Badge>
                                    </div>
                                </div>

                                {order.discountAmount > 0 && (
                                    <>
                                        <Separator className="bg-border/30"/>
                                        <div className="text-xs flex justify-between">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="text-muted-foreground">{order.totalAmount} FCFA</span>
                                        </div>
                                        <div className="text-xs flex justify-between">
                                            <span className="text-muted-foreground">Remise</span>
                                            <span className="text-red-500">-{order.discountAmount} FCFA</span>
                                        </div>
                                        <div className="text-xs flex justify-between">
                                            <span className="font-medium">Net</span>
                                            <span className="font-bold text-primary">{order.netAmount} FCFA</span>
                                        </div>
                                    </>
                                )}

                                <Separator className="bg-border/30"/>

                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="text-xs flex justify-between">
                                            <span className="text-muted-foreground font-medium">{item.quantity}x {item.productName || 'Produit'}</span>
                                            <span className="font-semibold">{item.totalPrice}</span>
                                        </div>
                                    ))}
                                    {order.bundles?.map((bundle, idx) => (
                                        <div key={`b-${idx}`} className="text-xs flex justify-between">
                                            <span className="text-muted-foreground font-medium">{bundle.quantity}x {bundle.bundleName}</span>
                                            <span className="font-semibold">{bundle.totalPrice}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.receivedAmount > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                        Reçu: {order.receivedAmount} FCFA · Rendu: {order.changeAmount} FCFA
                                    </div>
                                )}

                                <div className="flex gap-2 mt-auto pt-2">
                                    {order.status === OrderStatusEnum.PENDING && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="flex-auto h-9 rounded-xl bg-primary shadow-sm"
                                                onClick={() => updateOrderStatusMutation.mutate({id: order.id!, status: OrderStatusEnum.PAID})}
                                            >
                                                Marquer Payé
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 rounded-xl text-destructive border-destructive hover:bg-destructive/10"
                                                onClick={() => updateOrderStatusMutation.mutate({id: order.id!, status: OrderStatusEnum.CANCELLED})}
                                            >
                                                <XCircleIcon className="size-4"/>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </AnimatedContent>
    );
}
