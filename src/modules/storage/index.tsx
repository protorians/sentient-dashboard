import {StorageService} from "@/modules/storage/application/service/storage.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {StorageWidget} from "@/modules/storage/presentation/widgets/storage.widget";

const storageModule: ModuleDeclarationInterface = {
    id: 'storage',
    key: 'STORAGE',
    name: 'Stockage',
    description: 'Gestion des fichiers',
    icon: "DatabaseIcon",
    logo: undefined,
    widgets: {
        analytics: StorageWidget
    },
    service: {
        fetch: StorageService
    },
    url: '/storage',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default storageModule
