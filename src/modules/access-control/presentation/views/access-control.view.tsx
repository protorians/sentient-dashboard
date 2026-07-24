"use client"

import * as React from "react"
import {AppSidebar} from "@/core/presentation/app-sidebar"
import {DataGrid} from "@/core/presentation/data-grid"
import {DashboardHeader} from "@/modules/dashboard/presentation/components/dashboard-header"
import {SidebarInset, SidebarProvider} from "@/core/presentation/ui/sidebar"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs"
import {Badge} from "@/core/presentation/ui/badge"
import {PlusIcon, ShieldIcon, UsersIcon, KeyIcon, LockIcon} from "lucide-react"
import {Label} from "@/core/presentation/ui/label"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select"
import {Button} from "@/core/presentation/ui/button"
import {ModuleWidget} from "@/core/presentation/module-widget"

import {AccessControlApiService} from "../../application/service/access-control-api.service"
import {OrganizationsApiService} from "@/modules/organizations/application/service/organizations-api-service"
import {accessControlColumns, type AccessControlRow} from "../components/access-control-columns"
import {RolesSummaryType} from "../../domain/entities/roles.interface";
import {View} from "@/core/presentation/themes/katon/view";
import {Header} from "@/core/presentation/themes/katon/header";
import {Main} from "@/core/presentation/themes/katon/main";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";

export function AccessControlView() {
    const [roles, setRoles] = React.useState<AccessControlRow[]>([])
    const [loading, setLoading] = React.useState(true)
    const [summary, setSummary] = React.useState<RolesSummaryType | null>(null)

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                // 1. Charger le résumé pour les stats globales
                const summaryRes = await AccessControlApiService.getSummary()

                setSummary(summaryRes.data.data)

                // 2. Charger les rôles d'une organisation
                // Pour l'instant on prend la première organisation disponible
                const orgsRes = await OrganizationsApiService.getAll()
                const organizations = orgsRes.data

                if (organizations && organizations.length > 0) {
                    const rolesRes = await AccessControlApiService.getRolesByOrg(organizations[0].id)
                    setRoles(rolesRes.data || [])
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données d'accès:", error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const totalUsers = roles.reduce((acc, curr) => acc + (curr.usersCount || 0), 0)
    const totalRoles = summary ? Object.keys(summary).length : roles.length

    // Calculer des stats globales à partir du résumé
    const stats = React.useMemo(() => {
        if (!summary) return {domains: 0, fullAccess: 0, blocked: 0}

        const rolesList = Object.values(summary)
        const firstRole = rolesList[0]

        return {
            domains: firstRole?.stats.totalDomains ?? 0,
            fullAccess: rolesList.reduce((acc, curr) => acc + curr.stats.fullAccess, 0),
            blocked: rolesList.reduce((acc, curr) => acc + curr.stats.blocked, 0)
        }
    }, [summary])

    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="">
                    <div className="flex flex-1 flex-col p-4 lg:p-6">
                        <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 md:gap-6">
                                <div className="lg:col-span-4 lg:order-first flex flex-col gap-6">
                                    <ModuleWidget
                                        title="Contrôle d'Accès"
                                        description="Gestion des rôles et permissions"
                                        stats={[
                                            {
                                                label: "Total Rôles",
                                                amount: totalRoles,
                                                description: "rôles configurés"
                                            },
                                            {
                                                label: "Utilisateurs Assignés",
                                                amount: totalUsers,
                                                description: "nouveaux accès"
                                            }
                                        ]}
                                    />

                                    <ModuleWidget
                                        title="Actions Rapides"
                                        className=""
                                    >
                                        <div className="flex flex-col gap-2 pb-6">
                                            <Button variant="outline" className="justify-start gap-2">
                                                <ShieldIcon className="size-4"/>
                                                Nouveau Rôle Personnalisé
                                            </Button>
                                            <Button variant="outline" className="justify-start gap-2">
                                                <KeyIcon className="size-4"/>
                                                Gérer les Clés API
                                            </Button>
                                            <Button variant="outline" className="justify-start gap-2">
                                                <LockIcon className="size-4"/>
                                                Audit de Sécurité
                                            </Button>
                                        </div>
                                    </ModuleWidget>
                                </div>
                                <div className="lg:col-span-8 lg:order-last flex flex-col gap-4 md:gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <ModuleWidget
                                            title="Domaines"
                                            stats={[{label: "Couverture", amount: stats.domains}]}
                                            className="md:col-span-1"
                                        />
                                        <ModuleWidget
                                            title="Accès Complets"
                                            stats={[{label: "Total", amount: stats.fullAccess}]}
                                            className="md:col-span-1"
                                        />
                                        <ModuleWidget
                                            title="Restrictions"
                                            stats={[{label: "Total Bloqué", amount: stats.blocked}]}
                                            className="md:col-span-1"
                                        />
                                    </div>

                                    <Tabs
                                        defaultValue="roles"
                                        className="w-full flex-col justify-start gap-6"
                                    >
                                        <div className="flex items-center justify-between px-4 lg:px-6">
                                            <Label htmlFor="view-selector" className="sr-only">
                                                Vue
                                            </Label>
                                            <Select defaultValue="roles">
                                                <SelectTrigger
                                                    className="flex w-fit @4xl/main:hidden"
                                                    size="sm"
                                                    id="view-selector"
                                                >
                                                    <SelectValue placeholder="Choisir une vue"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="roles">Rôles</SelectItem>
                                                        <SelectItem value="permissions">Permissions</SelectItem>
                                                        <SelectItem value="assignments">Affectations</SelectItem>
                                                        <SelectItem value="logs">Logs d'audit</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <TabsList
                                                className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
                                                <TabsTrigger value="roles">Rôles</TabsTrigger>
                                                <TabsTrigger value="permissions">
                                                    Permissions <Badge variant="secondary">42</Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="assignments">
                                                    Affectations <Badge variant="secondary">{totalUsers}</Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="logs">Audit</TabsTrigger>
                                            </TabsList>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm">
                                                    <PlusIcon/>
                                                    <span className="hidden lg:inline">Ajouter un Rôle</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <TabsContent
                                            value="roles"
                                            className="relative flex flex-col gap-4 overflow-auto"
                                        >
                                            {loading ? (
                                                <div
                                                    className="flex h-64 items-center justify-center text-muted-foreground">
                                                    Chargement des rôles...
                                                </div>
                                            ) : (
                                                <DataGrid
                                                    data={roles}
                                                    columns={accessControlColumns}
                                                    getRowId={(row) => row.id}
                                                    enableDnd
                                                    enableSelection
                                                    containerClassName="gap-0"
                                                />
                                            )}
                                        </TabsContent>
                                        <TabsContent
                                            value="permissions"
                                            className="flex flex-col px-4 lg:px-6"
                                        >
                                            <div
                                                className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                                                Liste des permissions détaillées
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="assignments" className="flex flex-col px-4 lg:px-6">
                                            <div
                                                className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                                                Tableau des affectations utilisateurs
                                            </div>
                                        </TabsContent>
                                        <TabsContent
                                            value="logs"
                                            className="flex flex-col px-4 lg:px-6"
                                        >
                                            <div
                                                className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                                                Journal d'audit de sécurité
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </Main>
                <Footer>

                </Footer>
            </Wrapper>
        </View>
    )
}
