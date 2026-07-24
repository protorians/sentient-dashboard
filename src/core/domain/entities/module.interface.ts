import React from "react";
import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {IconKey} from "@/core/presentation/icons/types";

export type ModuleType = 'INTERNAL' | 'EXTERNAL';

export interface ModuleWidgetsInterface{
    [K: string]: React.ComponentType<any>;
}

export interface ModuleDeclarationInterface {
    id: string;
    key?: string;
    name: string;
    description: string;
    icon: IconKey;
    logo?: string;
    widgets?: ModuleWidgetsInterface;
    service?: {
        fetch?: ApiService
    };
    url: string; // URL de base pour la navigation
    isEnabled?: boolean;
    isDefault?: boolean; // Si true, ne peut pas être désactivé ou déplacé
    type: ModuleType;
}

export interface ModuleNavigationDropdownInterface {
    type: 'mega' | 'default';
    component: (module: ModuleNavigationInterface) => React.ReactNode;
}

export interface ModuleNavigationInterface {
    label: string;
    description?: string;
    icon?: IconKey;
    url: string;
    useOnlyIcon?: boolean;
    dropdown?: ModuleNavigationDropdownInterface
}