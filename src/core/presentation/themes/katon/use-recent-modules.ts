"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ModuleDeclarationInterface, ModuleNavigationInterface } from "@/core/domain/entities/module.interface"
import { useModuleStore } from "@/core/infrastructure/stores/module.store"

const STORAGE_KEY = "recent-modules"
const MAX_RECENT = 5

function loadIds(): string[] {
    if (typeof window === "undefined") return []
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    } catch {
        return []
    }
}

function saveIds(ids: string[]) {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function moduleToNavItem(mod: ModuleDeclarationInterface): ModuleNavigationInterface {
    return {
        id: mod.id,
        label: mod.name,
        icon: mod.icon,
        url: mod.uri,
        useOnlyIcon: true,
    }
}

export function useRecentModules(): ModuleNavigationInterface[] {
    const pathname = usePathname()
    const modules = useModuleStore(s => s.modules)
    const [recent, setRecent] = useState<ModuleNavigationInterface[]>([])

    useEffect(() => {
        if (modules.length === 0) return

        const ids = loadIds()
        if (ids.length === 0) return

        setRecent(
            [...new Set(ids)]
                .map(id => modules.find(m => m.id === id))
                .filter((m): m is ModuleDeclarationInterface => !!m)
                .map(moduleToNavItem)
        )
    }, [modules])

    useEffect(() => {
        if (modules.length === 0) return

        const current = modules.find(m => {
            if (!m.uri || m.uri === "/") return false
            return pathname.startsWith(m.uri)
        })
        if (!current) return

        const ids = loadIds()
        const updated = [...new Set([current.id, ...ids.filter(id => id !== current.id)])].slice(0, MAX_RECENT)
        saveIds(updated)

        setRecent(
            updated
                .map(id => modules.find(m => m.id === id))
                .filter((m): m is ModuleDeclarationInterface => !!m)
                .map(moduleToNavItem)
        )
    }, [pathname, modules])

    return recent
}
