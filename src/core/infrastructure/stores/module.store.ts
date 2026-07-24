"use client"

import {create} from "zustand";
import {persist} from "zustand/middleware";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";

interface ModuleState {
    modules: ModuleDeclarationInterface[];
    addModule: (module: ModuleDeclarationInterface) => void;
    addModules: (modules: ModuleDeclarationInterface[]) => void;
    toggleModule: (id: string) => void;
    removeModule: (id: string) => void;
    setModules: (modules: ModuleDeclarationInterface[]) => void;
}

export const useModuleStore = create<ModuleState>()(
    // persist(
        (setState, getState) => ({
            modules: [],
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
        })
        // {
        //     name: "module-storage",
        // }
    // )
);
