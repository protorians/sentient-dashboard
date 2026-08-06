"use client"

import React from "react";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {UtensilsIcon, PlusIcon} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";

interface TableSelectorProps {
    tables: PosTableInterface[];
    selectedTable: PosTableInterface | null;
    isLoading: boolean;
    onSelect: (table: PosTableInterface | null) => void;
    onCreateClick: () => void;
}

export function TableSelector({tables, selectedTable, isLoading, onSelect, onCreateClick}: TableSelectorProps) {
    return (
        <Card className="p-4 border-none shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <UtensilsIcon className="size-4 text-primary"/>
                    Table
                </h3>
                <div className="flex items-center gap-1.5">
                    {isLoading && <WaitingActivity size={16}/>}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={onCreateClick}
                        title="Créer une table"
                    >
                        <PlusIcon className="size-4"/>
                    </Button>
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tables.slice(0, 8).map(table => {
                    const isSelected = selectedTable?.id === table.id;
                    return (
                        <Button
                            key={table.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn("rounded-lg h-9 min-w-[80px]", isSelected && "bg-primary text-primary-foreground")}
                            onClick={() => onSelect(isSelected ? null : table)}
                        >
                            {table.label}
                        </Button>
                    );
                })}
                {tables.length === 0 && !isLoading && (
                    <span className="text-xs text-muted-foreground self-center py-1.5">
                        Aucune table — créez-en une avec « + »
                    </span>
                )}
            </div>
        </Card>
    );
}
