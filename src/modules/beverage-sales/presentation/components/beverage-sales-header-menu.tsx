"use client"

import {useMemo} from "react";
import {useRouter, usePathname} from "next/navigation";
import {Button} from "@/core/presentation/ui/button";
import {DynamicIcon} from "@/core/presentation/components/dynamic-icon";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {ModuleNavigationMenuItem} from "@/core/domain/entities/module.interface";

export function BeverageSalesHeaderMenu() {
    const router = useRouter();
    const pathname = usePathname();
    const {modules} = useModuleStore();

    const menuItems = useMemo<ModuleNavigationMenuItem[]>(() => {
        const mod = modules.find(m => m.key === 'BEVERAGE_SALES');
        return mod?.menu?.items.filter((item): item is ModuleNavigationMenuItem => !('separator' in item)) ?? [];
    }, [modules]);

    return (
        <div id="beverage-sales-header-menubar" className="flex items-center gap-1 md:ml-auto">
            {menuItems.map((item) => {
                const itemPath = item.url ?? '';
                const isActive = itemPath && (pathname === itemPath || pathname.startsWith(itemPath + '/'));
                return (
                    <Button
                        key={item.label}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        onClick={() => itemPath && router.push(itemPath)}
                        className="gap-1.5"
                    >
                        {item.icon && <DynamicIcon name={item.icon} size={4} />}
                        {item.label}
                    </Button>
                );
            })}
        </div>
    );
}
