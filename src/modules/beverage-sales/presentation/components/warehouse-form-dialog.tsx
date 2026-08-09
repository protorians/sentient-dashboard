"use client"

import React, {useEffect, useState} from "react";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {Label} from "@/core/presentation/ui/label";
import {Switch} from "@/core/presentation/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/core/presentation/ui/dialog";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";

export interface WarehouseFormData {
    name: string;
    address?: string;
    status: boolean;
}

interface WarehouseFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouse?: WarehouseInterface | null;
    onSave: (data: WarehouseFormData) => Promise<void>;
    isSaving?: boolean;
}

export function WarehouseFormDialog({open, onOpenChange, warehouse, onSave, isSaving}: WarehouseFormDialogProps) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState(true);

    useEffect(() => {
        if (!open) return;
        setName(warehouse?.name ?? '');
        setAddress(warehouse?.address ?? '');
        setStatus(warehouse?.status ?? true);
    }, [open, warehouse]);

    const isEdit = !!warehouse;

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({
            name: name.trim(),
            address: address.trim() || undefined,
            status,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Modifier le dépôt" : "Nouveau dépôt"}</DialogTitle>
                    <DialogDescription>
                        Dépôt de type <strong>BEVERAGE_DEPOT</strong> utilisé par la caisse de vente de boissons.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="warehouse-name">Nom *</Label>
                        <Input
                            id="warehouse-name"
                            placeholder="Ex : Dépôt principal, Dépôt Est..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="warehouse-address">Adresse</Label>
                        <Input
                            id="warehouse-address"
                            placeholder="Adresse du dépôt (optionnel)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                            <Label htmlFor="warehouse-status" className="text-sm">Actif</Label>
                            <span className="text-xs text-muted-foreground">Le dépôt est disponible pour la caisse</span>
                        </div>
                        <Switch
                            id="warehouse-status"
                            checked={status}
                            onCheckedChange={setStatus}
                        />
                    </div>
                </div>

                <DialogFooter showCloseButton>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || isSaving}
                    >
                        {isSaving ? <WaitingActivity size={18}/> : (isEdit ? "Enregistrer" : "Créer le dépôt")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
