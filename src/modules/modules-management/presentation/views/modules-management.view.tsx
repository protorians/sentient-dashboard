"use client"

import * as React from "react"
import {AppSidebar} from "@/core/presentation/app-sidebar"
import {SidebarInset, SidebarProvider} from "@/core/presentation/ui/sidebar"
import {useModuleStore} from "@/core/infrastructure/stores/module.store"
import {DynamicIcon} from "@/core/presentation/components/dynamic-icon"
import {Switch} from "@/core/presentation/ui/switch"
import {Button} from "@/core/presentation/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card"
import {PlusIcon, Trash2Icon, InfoIcon} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/core/presentation/ui/dialog"
import {Input} from "@/core/presentation/ui/input"
import {Label} from "@/core/presentation/ui/label"
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {IconKey} from "@/core/presentation/icons/types";

export function ModulesManagementView() {
    const {modules, toggleModule, removeModule, addModule} = useModuleStore();
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [newModule, setNewModule] = React.useState<ModuleDeclarationInterface>({
        isDefault: false,
        isEnabled: false,
        key: "",
        // logo: "",
        // service: {fetch: undefined},
        type: "EXTERNAL",
        // widgets: undefined,
        id: "",
        name: "",
        description: "",
        icon: "PackageIcon",
        url: ""
    });

    const handleAddModule = (e: React.FormEvent) => {
        e.preventDefault();
        addModule({
            ...newModule,
            isEnabled: true,
            isDefault: false
        });
        setIsAddDialogOpen(false);
        setNewModule({
            key: "",
            id: "",
            name: "",
            description: "",
            icon: "PackageIcon",
            url: "",
            type: "EXTERNAL",
            isDefault: false,
            isEnabled: false,
        });
    };

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset"/>
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">Gestion des Modules</h1>
                    </div>
                </header>

                <div className="flex flex-1 flex-col p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Modules du système</h2>
                            <p className="text-muted-foreground">
                                Activez ou désactivez les fonctionnalités de votre dashboard.
                            </p>
                        </div>

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <PlusIcon className="size-4"/>
                                    Installer un module
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleAddModule}>
                                    <DialogHeader>
                                        <DialogTitle>Installer un nouveau module</DialogTitle>
                                        <DialogDescription>
                                            Remplissez les informations pour ajouter un module externe au système.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="id">ID du module</Label>
                                            <Input
                                                id="id"
                                                value={newModule.id}
                                                onChange={(e) => setNewModule({...newModule, id: e.target.value})}
                                                placeholder="ex: my-custom-module"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nom</Label>
                                            <Input
                                                id="name"
                                                value={newModule.name}
                                                onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                                                placeholder="Mon Module"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="url">URL de navigation</Label>
                                            <Input
                                                id="url"
                                                value={newModule.url}
                                                onChange={(e) => setNewModule({...newModule, url: e.target.value})}
                                                placeholder="/my-module"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="icon">Icône (Lucide name)</Label>
                                            <Input
                                                id="icon"
                                                value={newModule.icon}
                                                onChange={(e) => setNewModule({...newModule, icon: e.target.value as IconKey})}
                                                placeholder="PackageIcon"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Input
                                                id="description"
                                                value={newModule.description}
                                                onChange={(e) => setNewModule({
                                                    ...newModule,
                                                    description: e.target.value
                                                })}
                                                placeholder="Description brève..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Installer</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module) => (
                            <Card key={module.id} className={!module.isEnabled ? "opacity-60" : ""}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <DynamicIcon name={module.icon} className="size-5 text-primary"/>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{module.name}</CardTitle>
                                            <CardDescription
                                                className="line-clamp-1">{module.description}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={module.isEnabled}
                                            onCheckedChange={() => toggleModule(module.id)}
                                            disabled={module.isDefault && module.isEnabled} // On ne désactive pas les modules par défaut si activés (selon besoin, ici on permet si c'est pas marqué immutable)
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mt-4">
                                        <div
                                            className="text-xs font-medium px-2 py-1 bg-muted rounded-md text-muted-foreground uppercase">
                                            {module.type}
                                        </div>
                                        {!module.isDefault && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removeModule(module.id)}
                                            >
                                                <Trash2Icon className="size-4"/>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
