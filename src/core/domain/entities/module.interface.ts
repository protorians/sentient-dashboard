import React from "react";
import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export type ModuleType = 'INTERNAL' | 'EXTERNAL';

export interface ModuleDeclarationInterface {
    id: string;
    key?: string;
    name: string;
    description: string;
    icon: string; // Nom de l'icône Lucide
    logo?: string;
    widgets?: {
        analytics: React.ComponentType<any>;
    };
    service?: {
        fetch: FetchService
    };
    url: string; // URL de base pour la navigation
    isEnabled: boolean;
    isDefault: boolean; // Si true, ne peut pas être désactivé ou déplacé
    type: ModuleType;
}
