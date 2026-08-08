"use client"

import React from "react";
import {BeverageSalesHeader} from "@/modules/beverage-sales/presentation/components/beverage-sales-header";

export default function BeverageSalesLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 bg-muted/20 min-h-screen">
            <BeverageSalesHeader />
            {children}
        </div>
    );
}
