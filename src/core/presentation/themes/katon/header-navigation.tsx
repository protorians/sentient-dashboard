"use client"

import {ModuleNavigationInterface} from "@/core/domain/entities/module.interface";
import {defaultModulesNavConfig} from "@/core/domain/config/modules.config";
import Link from "next/link";
import {cn} from "@/core/infrastructure/utilities/utils";
import {LucideIcon} from "@/core/presentation/icons/lucide";
import {usePathname} from "next/navigation";
import {Fragment} from "react";
import {DropdownMenu, DropdownMenuTrigger} from "@/core/presentation/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/core/presentation/ui/sheet";
import {CommonClassName} from "@/core/infrastructure/utilities/classname.util";


export function HeaderNavigationItem(module: ModuleNavigationInterface) {
    const currentPathname = usePathname()
    const isActive = currentPathname.startsWith(module.url)

    const renderChildren = () => {
        return (
            <div className={"flex flex-row group relative"}>
                {module.icon && (<LucideIcon size={5} name={module.icon}/>)}
                <div className={cn(
                    "bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 absolute left-0 ml-10 whitespace-nowrap  transition-all",
                    "hidden group-hover:block"
                )}>{module.label}</div>
            </div>
        )
    }

    const itemClassName = cn(
        "aspect-square flex flex-row items-center gap-2 px-3 py-2 rounded-full text-xs transition-all",
        isActive && "bg-primary/90 text-primary-foreground border border-primary",
        !isActive && "text-foreground border border-transparent hover:bg-foreground/80 hover:text-background hover:border hover:border-foreground",
    )

    const isMega = module.dropdown?.type === "mega"
    const side = isMega ? "top" : "right"

    return (
        <Fragment>
            {
                module.dropdown
                    ? (
                        <Sheet modal={true}>
                            <SheetTrigger asChild>
                                <div className={cn(itemClassName, "cursor-pointer")}>
                                    {renderChildren()}
                                </div>
                            </SheetTrigger>
                            <SheetContent side={side} className={cn(
                                isMega && "h-full! max-h-screen! bg-background/50",
                            )}>
                                <SheetHeader>
                                    <SheetTitle>
                                        {module.label}
                                    </SheetTitle>
                                    {module.description && (
                                        <SheetDescription>
                                            {module.description}
                                        </SheetDescription>
                                    )}
                                </SheetHeader>
                                <div className="flex-auto flex-col gap-4 overflow-x-hidden overflow-y-auto">
                                    {module.dropdown?.component(module)}
                                </div>
                            </SheetContent>
                        </Sheet>
                    )
                    : (
                        <Link
                            href={module.url}
                            className={itemClassName}>
                            {renderChildren()}
                        </Link>
                    )
            }
        </Fragment>
    )
}

export function HeaderNavigation() {

    return (
        <nav
            className={cn(
                "flex flex-col items-center",
                CommonClassName.glossyBorder,
                CommonClassName.layer,
                "p-2"
            )}>
            {
                defaultModulesNavConfig.map((module, index) => {
                    return (
                        <HeaderNavigationItem key={`default-modules-nav-${index}`} {...module} />
                    )
                })
            }
        </nav>
    )
}