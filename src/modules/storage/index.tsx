import {StorageApiService} from "@/modules/storage/application/service/storage-api-service";
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
        fetch: StorageApiService
    },
    url: '/storage',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default storageModule
