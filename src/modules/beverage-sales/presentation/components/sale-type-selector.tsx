"use client"

import React from "react";
import {Tabs, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {ShoppingBagIcon, StoreIcon, TruckIcon} from "lucide-react";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";

interface SaleTypeSelectorProps {
    value: OrderTypeEnum;
    onChange: (value: OrderTypeEnum) => void;
}

export function SaleTypeSelector({value, onChange}: SaleTypeSelectorProps) {
    return (
        <div className="flex items-center gap-2 bg-background p-1 rounded-xl border">
            <Tabs value={value} onValueChange={(v) => onChange(v as OrderTypeEnum)} className="w-auto">
                <TabsList className="bg-transparent border-none">
                    <TabsTrigger value={OrderTypeEnum.DETAIL} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                        <ShoppingBagIcon className="size-4"/>
                        Détail
                    </TabsTrigger>
                    <TabsTrigger value={OrderTypeEnum.SEMI_GROS} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                        <StoreIcon className="size-4"/>
                        Semi-gros
                    </TabsTrigger>
                    <TabsTrigger value={OrderTypeEnum.GROS} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2">
                        <TruckIcon className="size-4"/>
                        Gros
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
