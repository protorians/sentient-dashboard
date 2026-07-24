import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";

export function retrieveModule(module?: string): ModuleDeclarationInterface | undefined {
    return useModuleStore.getState().modules
        .filter((m: ModuleDeclarationInterface) => {
            return m.key?.toLowerCase() === module?.replace(/-/g, '_').toLowerCase()
        })[0] || undefined;
}
