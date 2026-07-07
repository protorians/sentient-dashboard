"use client"

import { usePathname, useRouter } from "next/navigation"
import { useModuleStore } from "@/core/infrastructure/stores/module.store"
import * as React from "react"

export function ModuleGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { modules } = useModuleStore()
    const router = useRouter()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (!mounted) return

        // On ignore la page dashboard et la gestion des modules eux-mêmes
        if (pathname === '/dashboard' || pathname === '/modules' || pathname === '/') return

        // Trouver si le chemin actuel appartient à un module
        // On trie par longueur d'URL décroissante pour matcher le plus spécifique d'abord
        const sortedModules = [...modules].sort((a, b) => b.url.length - a.url.length)
        const currentModule = sortedModules.find(m => pathname.startsWith(m.url))
        
        if (currentModule && !currentModule.isEnabled) {
            router.replace('/dashboard')
        }
    }, [pathname, modules, router, mounted])

    return <>{children}</>
}
