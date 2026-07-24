import {ModuleDeclarationInterface, ModuleInstanceInterface} from "@/core/domain/entities/module.interface";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";

export class ModuleInstance implements ModuleInstanceInterface {

    protected declaration!: ModuleDeclarationInterface;

    constructor(public readonly identifier: string) {
        this.initialize();
    }

    protected initialize() {
        const {modules} = useModuleStore.getState();
        const find = modules.find(
            module => module.key === this.identifier || module.id === this.identifier
        );

        if (!find)
            throw new Error(`Module with identifier ${this.identifier} not found`);

        this.declaration = find;
    }

    getOption<K extends keyof ModuleDeclarationInterface>(key: K): ModuleDeclarationInterface[K] {
        return this.declaration[key];
    }

    get options(): ModuleDeclarationInterface {
        return this.declaration;
    }

    setOption<K extends keyof ModuleDeclarationInterface>(key: K, value: ModuleDeclarationInterface[K]): this {
        this.declaration[key] = value;
        return this;
    }
}