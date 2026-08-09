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
    selectedModule: ModuleDeclarationInterface | null;
    selectModule: (idOrKey: string) => void;
    construct: (idOrKey: string) => ModuleInstanceInterface | null;
}

export const useModuleStore = create<ModuleState>()(
    // persist(
    (setState, getState) => ({
        modules: [],
        selectedModule: null,
        addModule: (module) => setState((state) => ({
            modules: [...state.modules.filter(m => m.id !== module.id), module]
        })),
        addModules: (newModules: ModuleDeclarationInterface[]) =>
            setState((state) => {
                const existingIds = new Set(state.modules.map(m => m.id))
                const unique = newModules.filter(m => !existingIds.has(m.id))
                return {modules: [...state.modules, ...unique]}
            }),
        toggleModule: (id) => setState((state) => ({
            modules: state.modules.map((m) =>
                m.id === id && !m.isDefault ? {...m, isEnabled: !m.isEnabled} : m
            ),
        })),
        removeModule: (id) => setState((state) => ({
            modules: state.modules.filter((m) => m.id !== id || m.isDefault),
        })),
        setModules: (modules) => setState({modules}),
        construct: (idOrKey: string) => {
            const module = getState().modules.find(m => m.id === idOrKey || m.key === idOrKey);
            return (module && module.key) ? new ModuleInstance(module.key) : null;
        },
        selectModule: (idOrKey: string) => {
            const module = getState().modules.find(m => m.id === idOrKey || m.key === idOrKey);
            if (module) {
                setState({selectedModule: module});
            }
        }
    })
    // {
    //     name: "module-storage",
    // }
    // )
);
