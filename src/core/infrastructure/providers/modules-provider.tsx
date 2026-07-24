"use client"

import {usePathname} from "next/navigation";
import {useEffect} from "react";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";

export function ModulesProvider() {
    const {modules, selectModule} = useModuleStore();
    const pathname = usePathname();

    useEffect(() => {
        if (!modules) return;

        modules.forEach(module => {
            if (module.key && pathname.startsWith(module.uri))
                selectModule(module.key);
        });

    }, [pathname, modules]);

    return null;
}