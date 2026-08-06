"use client"

import React, {useEffect, useState} from "react";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {Label} from "@/core/presentation/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/core/presentation/ui/dialog";
import {WaitingActivity} from "@/core/presentation/waiting-activity";

interface TableCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultLabel?: string;
    defaultNumber?: number;
    onSave: (payload: { label: string; number?: number }) => Promise<void>;
    isSaving?: boolean;
}

export function TableCreateDialog({open, onOpenChange, defaultLabel, defaultNumber, onSave, isSaving}: TableCreateDialogProps) {
    const [label, setLabel] = useState('');
    const [number, setNumber] = useState<string>('');

    useEffect(() => {
        if (!open) return;
        setLabel(defaultLabel ?? '');
        setNumber(defaultNumber ? String(defaultNumber) : '');
    }, [open, defaultLabel, defaultNumber]);

    const handleSubmit = () => {
        if (!label.trim()) return;
        onSave({
            label: label.trim(),
            number: number ? Number(number) : undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nouvelle table</DialogTitle>
                    <DialogDescription>
                        Créez une table à la volée pour le dépôt. Elle sera disponible immédiatement dans la caisse.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="table-label">Libellé *</Label>
                        <Input
                            id="table-label"
                            placeholder="Ex : Table 7, Comptoir, Terrasse..."
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="table-number">Numéro</Label>
                        <Input
                            id="table-number"
                            type="number"
                            min={1}
                            placeholder="Optionnel"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter showCloseButton>
                    <Button
                        onClick={handleSubmit}
                        disabled={!label.trim() || isSaving}
                    >
                        {isSaving ? <WaitingActivity size={18}/> : 'Créer la table'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
