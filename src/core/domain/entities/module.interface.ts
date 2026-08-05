import React from "react";
import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {IconKey} from "@/core/presentation/icons/types";
import {RoutineInterface} from "@/core/domain/typing/routine.types";

export type ModuleType = 'INTERNAL' | 'EXTERNAL';

export interface ModuleWidgetsInterface {
    [K: string]: React.ComponentType<any>;
}

export interface ModuleInstanceInterface {
    readonly identifier: string;

    get options(): ModuleDeclarationInterface;

    getOption<K extends keyof ModuleDeclarationInterface>(key: K): ModuleDeclarationInterface[K];

    setOption<K extends keyof ModuleDeclarationInterface>(key: K, value: ModuleDeclarationInterface[K]): this;
}

export interface ModuleDeclarationInterface {
    id: string;
    key?: string;
    name: string;
    description: string;
    icon: IconKey;
    logo?: string;
    routines?: RoutineInterface<any>[];
    widgets?: ModuleWidgetsInterface;
    service?: {
        fetch?: ApiService
    };
    uri: string; // URL de base pour la navigation
    isEnabled?: boolean;
    isDefault?: boolean; // Si true, ne peut pas être désactivé ou déplacé
    type: ModuleType;
    menu?: ModuleNavigationMenu;
}

export interface ModuleNavigationDropdownInterface {
    type: 'mega' | 'default' | 'mini';
    side?: 'left' | 'right' | 'top' | 'bottom';
    component: (module: ModuleNavigationInterface) => React.ReactNode;
}

export interface ModuleNavigationInterface {
    id: string;
    label: string;
    description?: string;
    icon?: IconKey;
    url: string;
    useOnlyIcon?: boolean;
    dropdown?: ModuleNavigationDropdownInterface
}


export interface ModuleNavigationMenuItem {
    label: string;
    description?: string;
    icon?: IconKey;
    action?: () => void | Promise<void>;
    items?: (ModuleNavigationMenuItem | ModuleNavigationMenuSeparator)[];
}

export interface ModuleNavigationMenuSeparator {
    separator: boolean;
}

export interface ModuleNavigationMenu {
    items: ModuleNavigationMenuItem[];
}
