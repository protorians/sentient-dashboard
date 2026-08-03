"use client"

import {usePathname} from "next/navigation"
import {useEffect, useState} from "react"
import {useModuleStore} from "@/core/infrastructure/stores/module.store"
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth"
import {DomainsEnum} from "@/core/domain/enums/domains.enum"
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface"
import {UserInterface} from "@/modules/auth/domain/entities/user.interface"
import {ModulesGuardForbiddenView} from "@/core/presentation/components/modules-guard-forbidden"

const MODULE_DOMAINS: Record<string, DomainsEnum[]> = {
    DASHBOARD: [DomainsEnum.Analytics, DomainsEnum.Activity, DomainsEnum.UserActivity],
    ACCESS_CONTROL: [DomainsEnum.Role],
    USERS: [DomainsEnum.User, DomainsEnum.UserDevice],
    BILLING: [DomainsEnum.Invoice, DomainsEnum.PaymentMethod],
    BLOG: [DomainsEnum.Post, DomainsEnum.PostCategory, DomainsEnum.PostCollaborator],
    CRM: [DomainsEnum.Deal, DomainsEnum.Lead, DomainsEnum.Contact],
    NOTIFICATIONS: [DomainsEnum.Notification],
    ORGANIZATIONS: [DomainsEnum.Organization, DomainsEnum.OrganizationMember, DomainsEnum.OrganizationPreference],
    PROJECT_MANAGEMENT: [DomainsEnum.Project, DomainsEnum.Task, DomainsEnum.TaskReminder],
    RESTAURANT: [DomainsEnum.RestaurantDish, DomainsEnum.RestaurantMenu, DomainsEnum.RestaurantOrder, DomainsEnum.RestaurantCustomer, DomainsEnum.RestaurantSalesSession],
    STOCK: [DomainsEnum.Stock, DomainsEnum.StockMovement, DomainsEnum.Order, DomainsEnum.Product],
    STORAGE: [DomainsEnum.Media],
    USER_ACTIVITIES: [DomainsEnum.UserActivity, DomainsEnum.Activity],
}

// function findCurrentModule(pathname: string, modules: ModuleDeclarationInterface[]): ModuleDeclarationInterface | undefined {
//     const sortedModules = [...modules].sort((a, b) => b.uri.length - a.uri.length)
//     return sortedModules.find(module => pathname.startsWith(module.uri))
// }

function hasReadAccess(user: UserInterface | null | undefined, domains: DomainsEnum[]): boolean {
    if (!user?.permissions) return false
    return domains.every(domain => user.permissions?.[domain]?.read)
}

export function ModulesGuardProvider({children}: { children: React.ReactNode }) {
    const pathname = usePathname()
    const {modules, selectedModule: currentModule} = useModuleStore()
    const {user} = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <>{children}</>

    const isExcluded = pathname === '/' || pathname === '/dashboard' || pathname === '/modules' || pathname.startsWith('/auth')
    if (isExcluded) return <>{children}</>

    // const currentModule = findCurrentModule(pathname, modules)
    if (!currentModule) return <>{children}</>

    const domains = MODULE_DOMAINS[currentModule.key ?? currentModule.id] || []
    if (!domains || domains.length === 0) return <>{children}</>

    if (!hasReadAccess(user, domains)) {
        return <ModulesGuardForbiddenView module={currentModule}/>
    }

    return <>{children}</>
}
