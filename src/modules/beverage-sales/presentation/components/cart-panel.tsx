"use client"

import React, {useCallback} from "react";
import {CheckoutDialog, CheckoutDialogProps} from "@/modules/beverage-sales/presentation/components/checkout-dialog";
import {useModal} from "@/core/presentation/modals/hooks/useModal";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {OrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {CartItemLine, CartBundleLine} from "@/modules/beverage-sales/domain/cart.types";
import {PaymentMethodInterface} from "@/modules/beverage-sales/domain/payment-method.interface";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {
    PlusIcon,
    MinusIcon,
    TrashIcon,
    ShoppingCartIcon,
    WineIcon,
    GiftIcon,
    CoinsIcon,
    UserIcon,
    LayoutGridIcon,
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice, toBaseUnits} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface CartPanelProps {
    products?: ProductInterface[];
    bundles?: BundleInterface[];
    items: CartItemLine[];
    bundleLines: CartBundleLine[];
    customer?: CustomerInterface | null;
    customerName: string;
    table?: PosTableInterface | null;
    saleType: OrderTypeEnum;
    activeOrder?: OrderInterface | null;
    onUpdateItemQty: (productId: string, quantity: number) => void;
    onUpdateItemUnit: (productId: string, unit: MovementUnitEnum) => void;
    onRemoveItem: (productId: string) => void;
    onUpdateBundleQty: (bundleId: string, quantity: number) => void;
    onRemoveBundle: (bundleId: string) => void;
    onClearCart: () => void;
    onCheckout: (amountGiven: number, paymentMethodId: string) => void;
    isSubmitting?: boolean;
    paymentMethods?: PaymentMethodInterface[];
    isLoadingPaymentMethods?: boolean;
    selectedPaymentMethodId?: string | null;
    onPaymentMethodChange?: (id: string | null) => void;
    onAddPaymentMethod?: (name: string, type: string) => Promise<void>;
}

export function CartPanel({
    products,
    bundles,
    items,
    bundleLines,
    saleType,
    activeOrder,
    customer,
    customerName,
    table,
    onUpdateItemQty,
    onUpdateItemUnit,
    onRemoveItem,
    onUpdateBundleQty,
    onRemoveBundle,
    onClearCart,
    onCheckout,
    isSubmitting,
    paymentMethods,
    isLoadingPaymentMethods,
    selectedPaymentMethodId,
    onPaymentMethodChange,
    onAddPaymentMethod,
}: CartPanelProps) {
    const {open, close} = useModal();

    const itemTotal = items.reduce((sum, item) => {
        const product = products?.find(p => p.id === item.productId);
        return sum + (product ? toBaseUnits(product, item.quantity, item.unit) * item.unitPrice : 0);
    }, 0);

    const bundleTotal = bundleLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);

    const total = itemTotal + bundleTotal;
    const itemsCount = items.length + bundleLines.length;

    const openCheckout = useCallback(() => {
        const modalId = open(
            (props: CheckoutDialogProps) => (
                <CheckoutDialog
                    products={props.products}
                    bundles={props.bundles}
                    items={props.items}
                    bundleLines={props.bundleLines}
                    customer={props.customer}
                    customerName={props.customerName}
                    table={props.table}
                    saleType={props.saleType}
                    activeOrder={props.activeOrder}
                    total={props.total}
                    isSubmitting={props.isSubmitting}
                    paymentMethods={props.paymentMethods}
                    isLoadingPaymentMethods={props.isLoadingPaymentMethods}
                    selectedPaymentMethodId={props.selectedPaymentMethodId}
                    onPaymentMethodChange={props.onPaymentMethodChange}
                    onAddPaymentMethod={props.onAddPaymentMethod}
                    onConfirm={(amount) => {
                        if (props.selectedPaymentMethodId) {
                            onCheckout(amount, props.selectedPaymentMethodId);
                            close(modalId);
                        }
                    }}
                    close={() => close(modalId)}
                />
            ),
            {
                products,
                bundles,
                items,
                bundleLines,
                customer,
                customerName,
                table,
                saleType,
                activeOrder,
                total,
                isSubmitting,
                paymentMethods,
                isLoadingPaymentMethods,
                selectedPaymentMethodId,
                onPaymentMethodChange,
                onAddPaymentMethod,
            },
            {
                title: activeOrder ? `Valider la commande ${activeOrder.orderNumber}` : "Valider la commande",
                description: "Confirmez le montant remis par le client pour clôturer la vente.",
                size: "XXL",
                useHeight: true,
                scrollable: false,
                className: "max-h-[calc(100dvh-2rem)]",
            }
        );
    }, [open, close, products, bundles, items, bundleLines, customer, customerName, table, saleType, activeOrder, total, isSubmitting, paymentMethods, isLoadingPaymentMethods, selectedPaymentMethodId, onPaymentMethodChange, onAddPaymentMethod, onCheckout]);

    const getSaleTypeLabel = (type: OrderTypeEnum) => {
        switch (type) {
            case OrderTypeEnum.GROS: return 'Gros';
            case OrderTypeEnum.SEMI_GROS: return 'Semi-gros';
            case OrderTypeEnum.DETAIL: return 'Détail';
        }
    };

    const isReadOnly = activeOrder?.status === OrderStatusEnum.PAID;

    return (
        <Card className="p-5 border-none shadow-sm flex flex-col gap-5 sticky top-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-lg font-bold">
                        {activeOrder ? `Commande ${activeOrder.orderNumber}` : 'Détails de la commande'}
                    </h3>
                    {activeOrder && (
                        <div className="flex flex-col gap-0.5">
                            {isReadOnly ? (
                                <span className="text-[10px] text-green-600 font-medium">Commande payée</span>
                            ) : (
                                <span className="text-[10px] text-muted-foreground">Modification en cours</span>
                            )}
                            {activeOrder.billingOrderId && (
                                <span className="text-[10px] text-muted-foreground">
                                    Facture liée
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {!isReadOnly && (items.length > 0 || bundleLines.length > 0) && (
                    <Button variant="ghost" size="icon-sm" onClick={onClearCart} className="text-destructive hover:bg-destructive/10">
                        <TrashIcon className="size-4"/>
                    </Button>
                )}
            </div>

            {(customer || customerName.trim() || table) && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
                    {customer && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground truncate">
                            <UserIcon className="size-3 shrink-0"/>
                            {[customer.firstname, customer.lastname].filter(Boolean).join(' ') || customer.companyName}
                        </span>
                    )}
                    {!customer && customerName.trim() && (
                        <span className="inline-flex items-center gap-1.5 font-medium truncate">
                            <UserIcon className="size-3 shrink-0"/>
                            {customerName.trim()}
                        </span>
                    )}
                    {customer && table && <span className="text-border">·</span>}
                    {table && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground truncate">
                            <LayoutGridIcon className="size-3 shrink-0"/>
                            {table.label}
                        </span>
                    )}
                </div>
            )}

            <div className="overflow-y-auto space-y-3 pr-1 scrollbar-thin max-h-[320px]">
                {items.length === 0 && bundleLines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-44 text-muted-foreground gap-4">
                        <div className="bg-muted p-4 rounded-full">
                            <ShoppingCartIcon className="size-8 opacity-20"/>
                        </div>
                        <p className="text-sm font-medium">Le panier est vide</p>
                    </div>
                ) : (
                    <>
                        {items.map(item => {
                            const product = products?.find(p => p.id === item.productId);
                            const lineTotal = product ? toBaseUnits(product, item.quantity, item.unit) * item.unitPrice : 0;
                            return (
                                <div key={`${item.productId}-${item.unit}`} className="flex items-center gap-3">
                                    <div className="size-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <WineIcon className="size-6 text-muted-foreground/30"/>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-bold truncate">{product?.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onUpdateItemQty(item.productId, item.quantity - 1)}
                                                    disabled={isReadOnly}
                                                    className={isReadOnly
                                                        ? "size-6 rounded-full border border-border/40 text-muted-foreground/30 flex items-center justify-center cursor-not-allowed"
                                                        : "size-6 rounded-full border border-border text-muted-foreground flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors"}
                                                >
                                                    <MinusIcon className="size-3"/>
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateItemQty(item.productId, item.quantity + 1)}
                                                    disabled={isReadOnly}
                                                    className={isReadOnly
                                                        ? "size-6 rounded-full bg-muted text-muted-foreground/30 flex items-center justify-center cursor-not-allowed"
                                                        : "size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"}
                                                >
                                                    <PlusIcon className="size-3"/>
                                                </button>
                                            </div>
                                            <Select value={item.unit} onValueChange={(v) => onUpdateItemUnit(item.productId, v as MovementUnitEnum)} disabled={isReadOnly}>
                                                <SelectTrigger size="sm" className="h-6 rounded-lg text-[10px] px-1.5 w-auto gap-1">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={MovementUnitEnum.UNIT}>Unité</SelectItem>
                                                    <SelectItem value={MovementUnitEnum.PACK} disabled={!product?.unitsPerPack || product.unitsPerPack <= 0}>Pack</SelectItem>
                                                    <SelectItem value={MovementUnitEnum.CASE} disabled={!product?.unitsPerCase || product.unitsPerCase <= 0}>Casier</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold whitespace-nowrap">{formatPrice(lineTotal)}</span>
                                </div>
                            );
                        })}

                        {bundleLines.map(line => {
                            const bundle = bundles?.find(b => b.id === line.bundleId);
                            return (
                                <div key={line.bundleId} className="flex items-center gap-3">
                                    <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <GiftIcon className="size-6 text-primary/50"/>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-bold truncate">{bundle?.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                onClick={() => onUpdateBundleQty(line.bundleId, line.quantity - 1)}
                                                disabled={isReadOnly}
                                                className={isReadOnly
                                                    ? "size-6 rounded-full border border-border/40 text-muted-foreground/30 flex items-center justify-center cursor-not-allowed"
                                                    : "size-6 rounded-full border border-border text-muted-foreground flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors"}
                                            >
                                                <MinusIcon className="size-3"/>
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{line.quantity}</span>
                                            <button
                                                onClick={() => onUpdateBundleQty(line.bundleId, line.quantity + 1)}
                                                disabled={isReadOnly}
                                                className={isReadOnly
                                                    ? "size-6 rounded-full bg-muted text-muted-foreground/30 flex items-center justify-center cursor-not-allowed"
                                                    : "size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"}
                                            >
                                                <PlusIcon className="size-3"/>
                                            </button>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold whitespace-nowrap">{formatPrice(line.quantity * line.unitPrice)}</span>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold">Résumé de la commande</h4>
                <div className="bg-primary/5 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Articles ({itemsCount}) · {getSaleTypeLabel(saleType)}</span>
                        <span className="font-semibold">{formatPrice(total)}</span>
                    </div>
                    {isReadOnly && activeOrder.receivedAmount > 0 && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Montant remis</span>
                                <span className="font-semibold">{formatPrice(activeOrder.receivedAmount)}</span>
                            </div>
                            <div className={cn(
                                "flex items-center justify-between text-sm",
                                activeOrder.changeAmount >= 0 ? "text-green-600" : "text-destructive"
                            )}>
                                <span className="font-medium">Monnaie rendue</span>
                                <span className="font-bold">{formatPrice(activeOrder.changeAmount)}</span>
                            </div>
                        </>
                    )}
                    <div className="border-t border-dashed border-border/60 my-1"/>
                    <div className="flex items-center justify-between">
                        <span className="font-bold">Total</span>
                        <span className="text-lg font-black text-primary">{formatPrice(total)}</span>
                    </div>
                </div>

                {activeOrder?.status !== OrderStatusEnum.PAID ? (
                    <>
                        <Button
                            className="w-full h-12 rounded-xl text-base font-bold"
                            disabled={(items.length === 0 && bundleLines.length === 0) || isSubmitting}
                            onClick={openCheckout}
                        >
                            {isSubmitting ? <WaitingActivity size={20}/> : (
                                <>
                                    <CoinsIcon/>
                                    {activeOrder ? `Valider la commande ${activeOrder.orderNumber}` : 'Traiter la transaction'}
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-12 rounded-xl bg-green-500/10 text-green-700 font-bold text-sm">
                        Commande déjà payée
                    </div>
                )}
            </div>
        </Card>
    );
}
