"use client"

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModuleDeclarationInterface } from "@/core/domain/entities/module.interface";
import DefaultModules from "@/modules/available";

interface ModuleState {
    modules: ModuleDeclarationInterface[];
    addModule: (module: ModuleDeclarationInterface) => void;
    toggleModule: (id: string) => void;
    removeModule: (id: string) => void;
    setModules: (modules: ModuleDeclarationInterface[]) => void;
}

const DEFAULT_MODULES: ModuleDeclarationInterface[] = DefaultModules;

export const useModuleStore = create<ModuleState>()(
    persist(
        (set) => ({
            modules: DEFAULT_MODULES,
            addModule: (module) => set((state) => ({ 
                modules: [...state.modules.filter(m => m.id !== module.id), module] 
            })),
            toggleModule: (id) => set((state) => ({
                modules: state.modules.map((m) =>
                    m.id === id && !m.isDefault ? { ...m, isEnabled: !m.isEnabled } : m
                ),
            })),
            removeModule: (id) => set((state) => ({
                modules: state.modules.filter((m) => m.id !== id || m.isDefault),
            })),
            setModules: (modules) => set({ modules }),
        }),
        {
            name: "module-storage",
        }
    )
);
