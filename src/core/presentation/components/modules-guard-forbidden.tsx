"use client"

import {useRouter} from "next/navigation"
import {Button} from "@/core/presentation/ui/button"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty"
import {DynamicIcon} from "@/core/presentation/components/dynamic-icon"
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface"
import {TriangleAlert} from "lucide-react";

interface ModulesGuardForbiddenProps {
    module?: ModuleDeclarationInterface | null
}

export function ModulesGuardForbiddenView({module}: ModulesGuardForbiddenProps) {
    const router = useRouter()

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Empty className="max-w-md">
                <EmptyMedia variant="icon">
                    <DynamicIcon name="ShieldAlertIcon" className="size-5"/>
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>Accès refusé</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>
                    {module
                        ? <>Vous n&apos;avez pas la permission d&apos;accéder au module «&nbsp;{module.name}&nbsp;».</>
                        : <>Vous n&apos;avez pas la permission d&apos;accéder à ce module.</>}
                </EmptyDescription>
                <EmptyDescription className={"p-3"}>
                    <div className="gap-2 items-center text-xs text-muted-foreground">
                        <TriangleAlert className={"text-yellow-500 size-3 mr-2"}/>
                        Si vous avez le droit d'accès, cela peut être du problème de votre connexion.
                    </div>
                </EmptyDescription>
                <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => history.go(0)}>
                        Actualiser
                    </Button>
                    <Button size="lg" onClick={() => router.push('/dashboard')}>
                        Retour au tableau de bord
                    </Button>
                </div>
            </Empty>
        </div>
    )
}
