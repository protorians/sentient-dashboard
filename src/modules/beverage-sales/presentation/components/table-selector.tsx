"use client"

import React from "react";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {Button} from "@/core/presentation/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {PlusIcon} from "lucide-react";

interface TableSelectorProps {
    tables: PosTableInterface[];
    selectedTable: PosTableInterface | null;
    isLoading: boolean;
    onSelect: (table: PosTableInterface | null) => void;
    onCreateClick: () => void;
}

export function TableSelector({tables, selectedTable, isLoading, onSelect, onCreateClick}: TableSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <Select
                value={selectedTable?.id ?? "none"}
                onValueChange={(v) => {
                    if (v === "none") {
                        onSelect(null);
                        return;
                    }
                    onSelect(tables.find(t => t.id === v) ?? null);
                }}
            >
                <SelectTrigger className="h-11 flex-1 rounded-xl bg-muted/50 border-none">
                    <SelectValue placeholder="Sélectionner une table"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Sans table</SelectItem>
                    {tables.map(table => (
                        <SelectItem key={table.id} value={table.id}>
                            {table.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-xl shrink-0"
                onClick={onCreateClick}
                title="Créer une table"
                disabled={isLoading}
            >
                {isLoading ? <WaitingActivity size={16}/> : <PlusIcon className="size-4"/>}
            </Button>
        </div>
    );
}
