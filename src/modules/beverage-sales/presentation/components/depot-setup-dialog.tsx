"use client"

import React, {useEffect, useRef, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {useModal} from "@/core/presentation/modals/hooks/useModal";
import {Input} from "@/core/presentation/ui/input";
import {Label} from "@/core/presentation/ui/label";
import {Button} from "@/core/presentation/ui/button";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {toast} from "sonner";

interface FormProps {
    onCreated: () => void;
}

function DepotSetupForm({onCreated}: FormProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState("Dépôt principal");
    const [creating, setCreating] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setCreating(true);
        try {
            await StockApiService.createWarehouse({
                name: name.trim(),
                type: WarehouseTypeEnum.BEVERAGE_DEPOT,
            });
            await queryClient.invalidateQueries({queryKey: ['stock', 'warehouses']});
            toast.success("Dépôt créé avec succès");
            onCreated();
        } catch {
            toast.error("Échec de la création du dépôt");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <p className="text-sm text-muted-foreground">
                Aucun entrepôt de type <strong>BEVERAGE_DEPOT</strong> n&apos;existe.
                Veuillez en créer un pour utiliser le module de vente de boissons.
            </p>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="depot-name">Nom du dépôt</Label>
                <Input
                    id="depot-name"
                    placeholder="Ex : Dépôt principal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
            </div>
            <Button onClick={handleSubmit} disabled={creating || !name.trim()} className="w-full">
                {creating ? <WaitingActivity size={16}/> : "Créer le dépôt"}
            </Button>
        </div>
    );
}

export function DepotSetupDialog({show}: { show: boolean }) {
    const {open, close} = useModal();
    const modalIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!show) return;

        const id = open(DepotSetupForm, {
            onCreated: () => { if (modalIdRef.current) close(modalIdRef.current); },
        }, {
            title: "Configuration du dépôt",
            description: "Un entrepôt BEVERAGE_DEPOT est requis pour ce module.",
            locked: true,
            closable: false,
            size: "SM",
        });
        modalIdRef.current = id;

        return () => {
            try { close(id); } catch {}
        };
    }, [show]);

    return null;
}
