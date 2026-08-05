"use client"

import React from "react";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {DynamicIcon} from "@/core/presentation/components/dynamic-icon";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle
} from "@/core/presentation/ui/item";
import {Button} from "@/core/presentation/ui/button";
import {cn} from "@/core/infrastructure/utilities/utils";
import {ExternalLink} from "lucide-react";
import Link from "next/link";
import {defaultModulesNavConfig} from "@/core/domain/config/modules.config";


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
                url: m.uri,
                icon: <DynamicIcon name={m.icon}/>,
            }));
    }, [modules, mounted]);


    return (
        <div className="w-full p-6 flex flex-col gap-6">

            {/*<div className="">*/}
            {/*    <h1>Modules disponibles</h1>*/}
            {/*</div>*/}

            <ItemGroup className={"gap-y-1"}>
                {modules.map((module) => (
                    defaultModulesNavConfig
                        .map(m => m.id)
                        .includes(module.id)
                        ? null
                        : (
                            <Item
                                key={module.id}
                                variant="outline"
                                className={cn(
                                    !module.isEnabled ? "opacity-60" : "",
                                )}
                            >
                                <ItemMedia>
                                    <DynamicIcon name={module.icon} className="size-5 text-primary"/>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-lg">{module.name}</ItemTitle>
                                    <ItemDescription className="line-clamp-1">{module.description}</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Link href={module.uri}>
                                        <Button variant="outline">
                                            <ExternalLink/>
                                            Ouvrir
                                        </Button>
                                    </Link>
                                </ItemActions>
                            </Item>
                        )
                ))}
            </ItemGroup>
        </div>
    )
}
