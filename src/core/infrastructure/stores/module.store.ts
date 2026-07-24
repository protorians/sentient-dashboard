"use client"

import {create} from "zustand";
import {persist} from "zustand/middleware";
import {ModuleDeclarationInterface, ModuleInstanceInterface} from "@/core/domain/entities/module.interface";
import {ModuleInstance} from "@/core/application/module-instance";

interface ModuleState {
    modules: ModuleDeclarationInterface[];
    addModule: (module: ModuleDeclarationInterface) => void;
    addModules: (modules: ModuleDeclarationInterface[]) => void;
    toggleModule: (id: string) => void;
    removeModule: (id: string) => void;
    setModules: (modules: ModuleDeclarationInterface[]) => void;
    moduleSelected: ModuleDeclarationInterface | null;
    moduleInstantiate: (idOrKey: string) => ModuleInstanceInterface | null;
    selectModule: (idOrKey: string) => void;
}

export const useModuleStore = create<ModuleState>()(
    // persist(
    (setState, getState) => ({
        modules: [],
        moduleSelected: null,
        addModule: (module) => setState((state) => ({
            modules: [...state.modules.filter(m => m.id !== module.id), module]
        })),
        addModules: (modules: ModuleDeclarationInterface[]) =>
            setState({modules: [...getState().modules, ...modules]}),
        toggleModule: (id) => setState((state) => ({
            modules: state.modules.map((m) =>
                m.id === id && !m.isDefault ? {...m, isEnabled: !m.isEnabled} : m
            ),
        })),
        removeModule: (id) => setState((state) => ({
            modules: state.modules.filter((m) => m.id !== id || m.isDefault),
        })),
        setModules: (modules) => setState({modules}),
        moduleInstantiate: (idOrKey: string) => {
            const module = getState().modules.find(m => m.id === idOrKey || m.key === idOrKey);
            return (module && module.key) ? new ModuleInstance(module.key) : null;
        },
        selectModule: (idOrKey: string) => {
            const module = getState().modules.find(m => m.id === idOrKey || m.key === idOrKey);
            if (module) {
                setState({moduleSelected: module});
            }
        }
    })
    // {
    //     name: "module-storage",
    // }
    // )
);
