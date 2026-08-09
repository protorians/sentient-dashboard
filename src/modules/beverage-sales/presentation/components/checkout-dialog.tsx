"use client"

import React, {useEffect, useState} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {OrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {CartItemLine, CartBundleLine} from "@/modules/beverage-sales/domain/cart.types";
import {PaymentMethodInterface} from "@/modules/beverage-sales/domain/payment-method.interface";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {Badge} from "@/core/presentation/ui/badge";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {
    WineIcon,
    GiftIcon,
    UserIcon,
    LayoutGridIcon,
    DeleteIcon,
    EraserIcon,
    CheckCircle2Icon,
    ArrowLeftIcon,
    CreditCardIcon,
    CircleIcon,
    BanknoteIcon,
    SmartphoneIcon,
    LandmarkIcon,
    WalletIcon,
    QrCodeIcon,
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice, toBaseUnits} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
    CASH: "Espèces",
    CREDIT_CARD: "Carte bancaire",
    DEBIT_CARD: "Carte de débit",
    MOBILE_MONEY: "Mobile Money",
    BANK_TRANSFER: "Virement",
    CHECK: "Chèque",
    E_WALLET: "Wallet",
};

const PAYMENT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    CASH: BanknoteIcon,
    CREDIT_CARD: CreditCardIcon,
    DEBIT_CARD: CreditCardIcon,
    MOBILE_MONEY: SmartphoneIcon,
    BANK_TRANSFER: LandmarkIcon,
    CHECK: CreditCardIcon,
    E_WALLET: WalletIcon,
};

export interface CheckoutDialogProps {
    products?: ProductInterface[];
    bundles?: BundleInterface[];
    items: CartItemLine[];
    bundleLines: CartBundleLine[];
    customer?: CustomerInterface | null;
    customerName: string;
    table?: PosTableInterface | null;
    saleType: OrderTypeEnum;
    activeOrder?: OrderInterface | null;
    total: number;
    isSubmitting?: boolean;
    paymentMethods?: PaymentMethodInterface[];
    isLoadingPaymentMethods?: boolean;
    selectedPaymentMethodId?: string | null;
    onPaymentMethodChange?: (id: string | null) => void;
    onConfirm: (amountGiven: number, paymentMethodId: string) => void;
    close: () => void;
}

interface KeyButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}

function KeyButton({onClick, children, className}: KeyButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center justify-center h-14 rounded-xl bg-muted text-lg font-bold text-foreground active:translate-y-px active:bg-muted transition-all hover:bg-muted/80",
                className
            )}
        >
            {children}
        </button>
    );
}

export function CheckoutDialog(
    {
        items,
        bundleLines,
        products,
        bundles,
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
        onConfirm,
        close,
    }: CheckoutDialogProps) {
    const [amount, setAmount] = useState<string>(
        () => activeOrder?.receivedAmount && activeOrder.receivedAmount > 0 ? String(activeOrder.receivedAmount) : ""
    );
    const [localPaymentMethodId, setLocalPaymentMethodId] = useState<string | null>(() => selectedPaymentMethodId ?? null);

    useEffect(() => {
        if (isLoadingPaymentMethods || !paymentMethods || paymentMethods.length === 0) return;
        if (localPaymentMethodId) return;
        const cashMethod = paymentMethods.find(m => m.type === "CASH");
        const autoId = cashMethod?.id ?? paymentMethods[0]?.id;
        if (autoId) {
            setLocalPaymentMethodId(autoId);
            onPaymentMethodChange?.(autoId);
        }
    }, [isLoadingPaymentMethods, paymentMethods, localPaymentMethodId, onPaymentMethodChange]);

    const handleSelectMethod = (id: string) => {
        const newId = localPaymentMethodId === id ? null : id;
        setLocalPaymentMethodId(newId);
        onPaymentMethodChange?.(newId);
    };

    const amountGiven = Number(amount) || 0;
    const changeDue = amountGiven - total;
    const hasItems = items.length > 0 || bundleLines.length > 0;
    const hasSufficient = amountGiven > 0 && changeDue >= 0;
    const hasPaymentMethod = !!localPaymentMethodId;
    const canConfirm = hasItems && hasSufficient && hasPaymentMethod && !isSubmitting;

    const selectedMethod = paymentMethods?.find(m => m.id === localPaymentMethodId);

    const appendDigit = (digit: string) => {
        setAmount(prev => {
            const next = (prev === "0" ? "" : prev) + digit;
            return next.slice(0, 12);
        });
    };

    const handleAmountChange = (value: string) => {
        setAmount(value.replace(/\D+/g, "").slice(0, 12));
    };

    const backspace = () => setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : ""));
    const clear = () => setAmount("");
    const setExact = () => setAmount(String(total));

    const getSaleTypeLabel = (type: OrderTypeEnum) => {
        switch (type) {
            case OrderTypeEnum.GROS:
                return 'Gros';
            case OrderTypeEnum.SEMI_GROS:
                return 'Semi-gros';
            case OrderTypeEnum.DETAIL:
                return 'Detail';
        }
    };

    const hasMethods = !isLoadingPaymentMethods && paymentMethods && paymentMethods.length > 0;

    return (
        <div className="flex flex-col w-full h-full">
            <div
                className="flex-1 min-h-0 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                            Recapitulatif de la commande
                        </h3>
                        {activeOrder && (
                            <span
                                className="text-xs font-bold text-primary bg-primary/10 rounded-lg px-2.5 py-1 whitespace-nowrap">
                                {getSaleTypeLabel(saleType)}
                            </span>
                        )}
                    </div>

                    {(customer || customerName.trim() || table) && (
                        <div
                            className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
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
                            {table && (
                                <span className="inline-flex items-center gap-1.5 font-medium text-foreground truncate">
                                    <LayoutGridIcon className="size-3 shrink-0"/>
                                    {table.label}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {items.length === 0 && bundleLines.length === 0 ? (
                            <div
                                className="flex items-center justify-center h-32 text-sm text-muted-foreground bg-muted/40 rounded-xl">
                                Le panier est vide
                            </div>
                        ) : (
                            <>
                                {items.map(item => {
                                    const product = products?.find(p => p.id === item.productId);
                                    const lineTotal = product ? toBaseUnits(product, item.quantity, item.unit) * item.unitPrice : 0;
                                    return (
                                        <div key={`${item.productId}-${item.unit}`}
                                             className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2.5">
                                            <div
                                                className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <WineIcon className="size-5 text-muted-foreground/40"/>
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span
                                                    className="text-sm font-bold truncate">{product?.name ?? item.productId}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.quantity} x {formatPrice(item.unitPrice)}
                                                </span>
                                            </div>
                                            <span
                                                className="text-sm font-bold whitespace-nowrap">{formatPrice(lineTotal)}</span>
                                        </div>
                                    );
                                })}
                                {bundleLines.map(line => {
                                    const bundle = bundles?.find(b => b.id === line.bundleId);
                                    return (
                                        <div key={line.bundleId}
                                             className="flex items-center gap-3 bg-primary/5 rounded-xl px-3 py-2.5 border border-primary/10">
                                            <div
                                                className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <GiftIcon className="size-5 text-primary/60"/>
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span
                                                    className="text-sm font-bold truncate">{bundle?.name ?? line.bundleId}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {line.quantity} x {formatPrice(line.unitPrice)}
                                                </span>
                                            </div>
                                            <span
                                                className="text-sm font-bold whitespace-nowrap">{formatPrice(line.quantity * line.unitPrice)}</span>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <div className="flex items-center gap-2">
                            <CreditCardIcon className="size-4 text-muted-foreground"/>
                            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                Moyen de paiement
                            </h3>
                        </div>

                        {isLoadingPaymentMethods ? (
                            <div
                                className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/40 rounded-xl">
                                <WaitingActivity size={16}/>
                                Chargement des moyens de paiement...
                            </div>
                        ) : !hasMethods ? (
                            <div
                                className="text-sm text-muted-foreground p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                Aucun moyen de paiement configuré. Veuillez en ajouter depuis la gestion de facturation.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {paymentMethods!.map(method => {
                                    const isSelected = method.id === localPaymentMethodId;
                                    const TypeIcon = PAYMENT_TYPE_ICONS[method.type] ?? CreditCardIcon;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => handleSelectMethod(method.id)}
                                            className={cn(
                                                "flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left transition-all",
                                                isSelected
                                                    ? "bg-primary/10 border-2 border-primary ring-1 ring-primary/20"
                                                    : "bg-muted/40 border-2 border-transparent hover:bg-muted/60 hover:border-border/50"
                                            )}
                                        >
                                            <div className="shrink-0">
                                                {isSelected ? (
                                                    <CheckCircle2Icon
                                                        className="size-5 text-primary"/>
                                                ) : (
                                                    <CircleIcon
                                                        className="size-5 text-muted-foreground/40"/>
                                                )}
                                            </div>
                                            <div
                                                className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <TypeIcon className="size-4 text-muted-foreground"/>
                                            </div>
                                            <div
                                                className="flex flex-col flex-1 min-w-0">
                                                <span className="text-sm font-bold">{method.name}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {PAYMENT_TYPE_LABELS[method.type] ?? method.type}
                                                    {method.feeRate > 0 && ` · Frais ${method.feeRate}%`}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <Badge variant="default"
                                                       className="shrink-0 text-[10px] px-1.5 py-0 h-5">
                                                    Actif
                                                </Badge>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        Montant remis
                    </h3>

                    <div className="flex items-center justify-between gap-4 bg-muted/50 rounded-2xl px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Total a payer</span>
                            <span className="text-lg font-black text-primary">{formatPrice(total)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 min-w-0">
                            <span className="text-xs text-muted-foreground">Montant recu du client</span>
                            <div className="flex items-center gap-2 w-full justify-end">
                                <Input
                                    inputMode="decimal"
                                    autoComplete="off"
                                    value={amount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    placeholder="0"
                                    aria-label="Montant recu du client"
                                    disabled={isSubmitting}
                                    className="h-11 w-full max-w-[200px] rounded-xl border-transparent! focus:border-transparent! text-right text-4xl! bg-transparent! focus:bg-transparent! p-0! font-black tabular-nums px-3"
                                />
                                <span
                                    className="text-sm font-bold text-muted-foreground whitespace-nowrap">FCFA</span>
                            </div>
                        </div>
                    </div>

                    {selectedMethod && selectedMethod.type !== "CASH" && (
                        <div
                            className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <CreditCardIcon className="size-3.5 text-blue-500"/>
                            Paiement via {selectedMethod.name}
                            {selectedMethod.feeRate > 0 &&
                                <span className="text-amber-600">· Frais: {selectedMethod.feeRate}%</span>}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {[500, 1000, 2000, 5000, 10000].map(note => (
                            <KeyButton
                                key={note}
                                onClick={() => setAmount(prev => String((Number(prev) || 0) + note))}
                                className="h-10 text-sm font-bold px-3"
                            >
                                {note.toLocaleString('fr-FR')}
                            </KeyButton>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="grid grid-cols-3 gap-2 flex-1">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "000"].map(key => (
                                <KeyButton key={key} onClick={() => appendDigit(key)}>
                                    {key}
                                </KeyButton>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-20">
                            <KeyButton onClick={backspace} className="text-base">
                                <DeleteIcon className="size-5"/>
                            </KeyButton>
                            <KeyButton onClick={clear} className="text-base text-destructive">
                                <EraserIcon className="size-5"/>
                            </KeyButton>
                            <KeyButton onClick={setExact} className="text-xs px-2">
                                Exact
                            </KeyButton>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center justify-between text-sm rounded-xl px-4 py-3",
                        hasSufficient ? "bg-green-500/10 text-green-700" : amountGiven > 0 ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground"
                    )}>
                        <span className="font-medium">
                            {hasSufficient ? "Monnaie a rendre" : amountGiven > 0 ? "Montant manquant" : "Monnaie a rendre"}
                        </span>
                        <span className="text-2xl font-black tabular-nums">
                            {formatPrice(hasSufficient ? changeDue : amountGiven > 0 ? Math.abs(changeDue) : 0)}
                        </span>
                    </div>

                    {!hasPaymentMethod && (
                        <div
                            className="text-xs text-amber-600 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2 flex items-center gap-2">
                            <CreditCardIcon className="size-3.5 shrink-0"/>
                            Veuillez sélectionner un moyen de paiement pour valider.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-muted/50 px-5 py-3">
                <Button variant="outline" size="lg" onClick={close} disabled={isSubmitting}>
                    <ArrowLeftIcon/>
                    Revenir
                </Button>
                <Button
                    size="lg"
                    className="h-11 px-6 text-base font-bold"
                    disabled={!canConfirm}
                    onClick={() => onConfirm(amountGiven, localPaymentMethodId!)}
                >
                    {isSubmitting ? <WaitingActivity size={20}/> : (
                        <>
                            <CheckCircle2Icon/>
                            Valider la commande maintenant
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
