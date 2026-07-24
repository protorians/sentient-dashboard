"use client"

import React from "react";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {DynamicIcon} from "@/core/presentation/components/dynamic-icon";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Switch} from "@/core/presentation/ui/switch";
import {Button} from "@/core/presentation/ui/button";
import {cn} from "@/core/infrastructure/utilities/utils";
import {ExternalLink} from "lucide-react";
import Link from "next/link";


export function ModulesListSheet() {
    const {modules} = useModuleStore();
    const {user: authUser} = useAuth();
    const [mounted, setMounted] = React.useState(false);

    const dynamicNavMain = React.useMemo(() => {
        const modulesToUse = mounted ? modules : [];
        return modulesToUse
            .filter((m) => m.isEnabled)
            .map((m) => ({
                title: m.name,
                url: m.url,
                icon: <DynamicIcon name={m.icon}/>,
            }));
    }, [modules, mounted]);


    return (
        <div className="w-full p-6 flex flex-col gap-6">

            <div className="">
                <h1>Modules disponibles</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {modules.map((module) => (
                    <Card key={module.id} className={cn(
                        !module.isEnabled ? "opacity-60" : "",
                    )}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 ">
                            <div className="flex flex-col gap-6">
                                <div className="rounded-lg flex flex-row items-start flex-auto">
                                    <DynamicIcon name={module.icon} strokeWidth={1} className="size-10 text-primary"/>
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{module.name}</CardTitle>
                                    <CardDescription className="line-clamp-1">{module.description}</CardDescription>
                                </div>
                            </div>
                            <div className="flex flex-row items-start gap-2">
                                <Link href={module.url}>
                                    <Button variant="outline">
                                        <ExternalLink/>
                                        Ouvrir
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        {/*<CardContent>*/}
                        {/*    <div className="flex justify-between items-center mt-4">*/}
                        {/*        /!*<div*!/*/}
                        {/*        /!*    className="text-xs font-medium px-2 py-1 bg-muted rounded-md text-muted-foreground uppercase">*!/*/}
                        {/*        /!*    {module.type}*!/*/}
                        {/*        /!*</div>*!/*/}
                        {/*        /!*{!module.isDefault && (*!/*/}
                        {/*        /!*    <Button*!/*/}
                        {/*        /!*        variant="ghost"*!/*/}
                        {/*        /!*        size="icon"*!/*/}
                        {/*        /!*        className="text-destructive hover:text-destructive hover:bg-destructive/10"*!/*/}
                        {/*        /!*        onClick={() => removeModule(module.id)}*!/*/}
                        {/*        /!*    >*!/*/}
                        {/*        /!*        <Trash2Icon className="size-4"/>*!/*/}
                        {/*        /!*    </Button>*!/*/}
                        {/*        /!*)}*!/*/}
                        {/*    </div>*/}
                        {/*</CardContent>*/}
                    </Card>
                ))}
            </div>
        </div>
    )
}