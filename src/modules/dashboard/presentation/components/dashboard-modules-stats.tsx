"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {ListItems} from "@/core/presentation/list-items";
import {ReactNode} from "react";
import {CircleCheckIcon, CircleXIcon} from "lucide-react";

export function DashboardModulesStats() {
    const {modules} = useModuleStore();
    const list: Record<string, ReactNode> = {}

    for (const module of modules) {
        list[module.name] = module.isEnabled ? <CircleCheckIcon className={"text-green-500"}/> : <CircleXIcon className={"text-red-500"}/>;
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardDescription>Modules</CardDescription>
                <CardTitle></CardTitle>
            </CardHeader>
            <CardContent className={"flex flex-col gap-4"}>
                <ListItems
                    items={list}
                />
            </CardContent>
        </Card>
    )
}