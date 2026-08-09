"use client"

import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/core/presentation/ui/tooltip";
import {EdgeSection} from "@/core/presentation/themes/katon/edge-section";
import {Building2Icon} from "lucide-react";

export function HeaderOrganizationSelect() {
    const organization = AuthUserService.getCurrentOrganization();

    return (
        <div className="hidden sm:flex flex-row items-center justify-end pt-2">
            {
                organization && (
                    <Tooltip>
                        <TooltipTrigger>
                            <EdgeSection className="gap-2 px-4 py-2 text-foreground">
                                <span className={" text-sm leading-3"}>{organization.name}</span>
                                <Building2Icon size={16}/>
                            </EdgeSection>
                        </TooltipTrigger>
                        <TooltipContent>
                            {organization.description || 'Aucune description de l\'organisation'}
                        </TooltipContent>
                    </Tooltip>
                )
            }
        </div>
    )
}