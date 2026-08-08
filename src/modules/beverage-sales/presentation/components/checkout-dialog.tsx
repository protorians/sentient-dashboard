"use client"

import React, {useState} from "react";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {Badge} from "@/core/presentation/ui/badge";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {
    WineIcon,
    GiftIcon,
    UserIcon,
    LayoutGridIcon,
    CoinsIcon,
    DeleteIcon,
    EraserIcon,
    CheckCircle2Icon,
    ArrowLeftIcon,
    CreditCardIcon,
    PlusCircleIcon,
    CheckIcon,
    XIcon,
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice, toBaseUnits} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

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
    onAddPaymentMethod?: (name: string, type: string) => Promise<void>;
    onConfirm: (amountGiven: number) => void;
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

export function CheckoutDialog({
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
    onAddPaymentMethod,
    onConfirm,
    close,
}: CheckoutDialogProps) {
    const [amount, setAmount] = useState<string>(
        () => activeOrder?.receivedAmount && activeOrder.receivedAmount > 0 ? String(activeOrder.receivedAmount) : ""
    );
    const [showAddMethodForm, setShowAddMethodForm] = useState(false);
    const [newMethodName, setNewMethodName] = useState("");
    const [newMethodType, setNewMethodType] = useState("CASH");
    const [isAddingMethod, setIsAddingMethod] = useState(false);

    const amountGiven = Number(amount) || 0;
    const changeDue = amountGiven - total;
    const hasItems = items.length > 0 || bundleLines.length > 0;
    const hasSufficient = amountGiven > 0 && changeDue >= 0;
    const hasPaymentMethod = !!selectedPaymentMethodId;
    const canConfirm = hasItems && hasSufficient && hasPaymentMethod && !isSubmitting;

    const selectedMethod = paymentMethods?.find(m => m.id === selectedPaymentMethodId);

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

    const handleAddMethod = async () => {
        if (!newMethodName.trim() || !onAddPaymentMethod) return;
        setIsAddingMethod(true);
        try {
            await onAddPaymentMethod(newMethodName.trim(), newMethodType);
            setNewMethodName("");
            setShowAddMethodForm(false);
        } catch {
        } finally {
            setIsAddingMethod(false);
        }
    };

    const getSaleTypeLabel = (type: OrderTypeEnum) => {
        switch (type) {
            case OrderTypeEnum.GROS: return 'Gros';
            case OrderTypeEnum.SEMI_GROS: return 'Semi-gros';
            case OrderTypeEnum.DETAIL: return 'Detail';
        }
    };

    const hasMethods = !isLoadingPaymentMethods && paymentMethods && paymentMethods.length > 0;

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex-1 min-h-0 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                            Recapitulatif de la commande
                        </h3>
                        {activeOrder && (
                            <span className="text-xs font-bold text-primary bg-primary/10 rounded-lg px-2.5 py-1 whitespace-nowrap">
                                {getSaleTypeLabel(saleType)}
                            </span>
                        )}
                    </div>

                    {(customer || customerName.trim() || table) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
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
                            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground bg-muted/40 rounded-xl">
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
                                            <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <WineIcon className="size-5 text-muted-foreground/40"/>
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-sm font-bold truncate">{product?.name ?? item.productId}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.quantity} x {formatPrice(item.unitPrice)}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold whitespace-nowrap">{formatPrice(lineTotal)}</span>
                                        </div>
                                    );
                                })}
                                {bundleLines.map(line => {
                                    const bundle = bundles?.find(b => b.id === line.bundleId);
                                    return (
                                        <div key={line.bundleId}
                                             className="flex items-center gap-3 bg-primary/5 rounded-xl px-3 py-2.5 border border-primary/10">
                                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <GiftIcon className="size-5 text-primary/60"/>
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-sm font-bold truncate">{bundle?.name ?? line.bundleId}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {line.quantity} x {formatPrice(line.unitPrice)}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold whitespace-nowrap">{formatPrice(line.quantity * line.unitPrice)}</span>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <div className="flex items-center gap-2">
                            <CreditCardIcon className="size-4 text-muted-foreground" />
                            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                Moyen de paiement
                            </h3>
                        </div>

                        {isLoadingPaymentMethods ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/40 rounded-xl">
                                <WaitingActivity size={16} />
                                Chargement des moyens de paiement...
                            </div>
                        ) : !hasMethods ? (
                            <div className="flex flex-col gap-3">
                                <div className="text-sm text-muted-foreground p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                    Aucun moyen de paiement configuré. Veuillez en ajouter au moins un.
                                </div>
                                {showAddMethodForm ? (
                                    <div className="flex flex-col gap-2 p-3 bg-muted/40 rounded-xl">
                                        <Input
                                            placeholder="Nom (ex: Espèces, Carte bancaire...)"
                                            value={newMethodName}
                                            onChange={(e) => setNewMethodName(e.target.value)}
                                            className="h-10"
                                        />
                                        <Select value={newMethodType} onValueChange={setNewMethodType}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CASH">Espèces</SelectItem>
                                                <SelectItem value="CREDIT_CARD">Carte bancaire</SelectItem>
                                                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                                <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                                                <SelectItem value="CHECK">Chèque</SelectItem>
                                                <SelectItem value="E_WALLET">Portefeuille électronique</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={handleAddMethod}
                                                disabled={!newMethodName.trim() || isAddingMethod}
                                                className="gap-1.5"
                                            >
                                                {isAddingMethod ? <WaitingActivity size={14} /> : <CheckIcon className="size-4" />}
                                                Ajouter
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setShowAddMethodForm(false); setNewMethodName(""); }}
                                            >
                                                <XIcon className="size-4" />
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAddMethodForm(true)}
                                        className="gap-1.5 w-full"
                                    >
                                        <PlusCircleIcon className="size-4" />
                                        Ajouter un moyen de paiement
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Select value={selectedPaymentMethodId ?? ""} onValueChange={(v) => onPaymentMethodChange?.(v || null)}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="Sélectionner un moyen de paiement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods?.map(method => (
                                            <SelectItem key={method.id} value={method.id}>
                                                <span className="flex items-center gap-2">
                                                    {method.name}
                                                    {method.type === "CASH" && <Badge variant="outline" className="text-[10px] px-1 py-0">Espèces</Badge>}
                                                    {method.type === "MOBILE_MONEY" && <Badge variant="outline" className="text-[10px] px-1 py-0">Mobile</Badge>}
                                                    {method.type === "CREDIT_CARD" && <Badge variant="outline" className="text-[10px] px-1 py-0">CB</Badge>}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {onAddPaymentMethod && (
                                    showAddMethodForm ? (
                                        <div className="flex flex-col gap-2 p-3 bg-muted/40 rounded-xl mt-1">
                                            <Input
                                                placeholder="Nom du moyen de paiement"
                                                value={newMethodName}
                                                onChange={(e) => setNewMethodName(e.target.value)}
                                                className="h-9 text-sm"
                                            />
                                            <Select value={newMethodType} onValueChange={setNewMethodType}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CASH">Espèces</SelectItem>
                                                    <SelectItem value="CREDIT_CARD">Carte bancaire</SelectItem>
                                                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                                    <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                                                    <SelectItem value="CHECK">Chèque</SelectItem>
                                                    <SelectItem value="E_WALLET">Portefeuille électronique</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="default" onClick={handleAddMethod} disabled={!newMethodName.trim() || isAddingMethod} className="gap-1.5">
                                                    {isAddingMethod ? <WaitingActivity size={14} /> : <CheckIcon className="size-4" />}
                                                    Valider
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => { setShowAddMethodForm(false); setNewMethodName(""); }}>
                                                    <XIcon className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAddMethodForm(true)}
                                            className="gap-1.5 text-xs"
                                        >
                                            <PlusCircleIcon className="size-3.5" />
                                            Ajouter un autre moyen
                                        </Button>
                                    )
                                )}
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
                                <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">FCFA</span>
                            </div>
                        </div>
                    </div>

                    {selectedMethod && selectedMethod.type !== "CASH" && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <CreditCardIcon className="size-3.5 text-blue-500" />
                            Paiement via {selectedMethod.name}
                            {selectedMethod.feeRate > 0 && <span className="text-amber-600">· Frais: {selectedMethod.feeRate}%</span>}
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
                        <div className="text-xs text-amber-600 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2 flex items-center gap-2">
                            <CreditCardIcon className="size-3.5 shrink-0" />
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
                    onClick={() => onConfirm(amountGiven)}
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
