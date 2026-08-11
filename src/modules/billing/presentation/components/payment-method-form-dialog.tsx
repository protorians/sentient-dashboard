"use client"

import React, {useEffect, useState} from "react"
import {Button} from "@/core/presentation/ui/button"
import {Input} from "@/core/presentation/ui/input"
import {Label} from "@/core/presentation/ui/label"
import {Switch} from "@/core/presentation/ui/switch"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/core/presentation/ui/dialog"
import {WaitingActivity} from "@/core/presentation/waiting-activity"
import {PaymentMethodInterface} from "@/modules/billing/domain/payment-method.interface"
import {
    PaymentMethodTypeEnum,
    PAYMENT_METHOD_TYPE_OPTIONS,
} from "@/modules/billing/domain/enums/payment-method-type.enum"

export interface PaymentMethodFormData {
    name: string
    type: PaymentMethodTypeEnum
    feeAmount: number
    feeRate: number
}

interface PaymentMethodFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    method?: PaymentMethodInterface | null
    onSave: (data: PaymentMethodFormData) => Promise<void>
    isSaving?: boolean
}

export function PaymentMethodFormDialog({open, onOpenChange, method, onSave, isSaving}: PaymentMethodFormDialogProps) {
    const [name, setName] = useState('')
    const [type, setType] = useState<PaymentMethodTypeEnum>(PaymentMethodTypeEnum.CASH)
    const [feeRate, setFeeRate] = useState('0')
    const [feeAmount, setFeeAmount] = useState('0')

    useEffect(() => {
        if (!open) return
        setName(method?.name ?? '')
        setType(method?.type ?? PaymentMethodTypeEnum.CASH)
        setFeeRate(method?.feeRate ? String(method.feeRate) : '0')
        setFeeAmount(method?.feeAmount ? String(method.feeAmount) : '0')
    }, [open, method])

    const isEdit = !!method

    const handleSubmit = () => {
        if (!name.trim()) return
        onSave({
            name: name.trim(),
            type,
            feeRate: Number(feeRate) || 0,
            feeAmount: Number(feeAmount) || 0,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Modifier le moyen de paiement" : "Nouveau moyen de paiement"}</DialogTitle>
                    <DialogDescription>
                        Configurez un mode de paiement avec ses frais de transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="pm-name">Nom *</Label>
                        <Input
                            id="pm-name"
                            placeholder="Ex : Espèces, Orange Money, Carte..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="pm-type">Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as PaymentMethodTypeEnum)}>
                            <SelectTrigger id="pm-type">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {PAYMENT_METHOD_TYPE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pm-fee-rate">Frais (%)</Label>
                        <Input
                            id="pm-fee-rate"
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0"
                            value={feeRate}
                            onChange={(e) => setFeeRate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pm-fee-amount">Frais fixes (FCFA)</Label>
                        <Input
                            id="pm-fee-amount"
                            type="number"
                            min={0}
                            placeholder="0"
                            value={feeAmount}
                            onChange={(e) => setFeeAmount(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter showCloseButton>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || isSaving}
                    >
                        {isSaving ? <WaitingActivity size={18}/> : (isEdit ? "Enregistrer" : "Ajouter")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
