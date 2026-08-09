"use client"

import React from "react";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";

export default function BeverageSalesSettingsLayout({children}: { children: React.ReactNode }) {
    return (
        <SettingsLayout>
            <SettingsLayout.Menu className={"flex flex-col gap-6"}>
                <div className="">
                    <h2>Paramètres</h2>
                </div>
                <SettingsLayout.MenuItem
                    href="/beverage-sales/settings/warehouses"
                    label="Dépôts"
                    icon="WarehouseIcon"
                />
                <SettingsLayout.MenuItem
                    href="/beverage-sales/settings/payment-methods"
                    label="Modes de paiement"
                    icon="CreditCardIcon"
                />
                <SettingsLayout.MenuItem
                    href="/beverage-sales/settings/register"
                    label="Caisse"
                    icon="ClockIcon"
                />
                <SettingsLayout.MenuItem
                    href="/beverage-sales/settings/accounting"
                    label="Comptabilité"
                    icon="ReceiptTextIcon"
                />
            </SettingsLayout.Menu>
            <SettingsLayout.Container>
                {children}
            </SettingsLayout.Container>
        </SettingsLayout>
    );
}
