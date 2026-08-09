"use client"

import React from "react";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "@/core/presentation/ui/button";
import {DynamicIcon} from "@/core/presentation/components/dynamic-icon";
import {cn} from "@/core/infrastructure/utilities/utils";
import {IconKey} from "@/core/presentation/icons/types";

interface SettingsLayoutProps {
    children: React.ReactNode;
    className?: string;
}

function SettingsLayout({children, className}: SettingsLayoutProps) {
    return (
        <div className={cn("flex flex-col lg:flex-row gap-6 w-full", className)}>
            {children}
        </div>
    );
}

interface SettingsMenuProps {
    children: React.ReactNode;
    className?: string;
}

function SettingsMenu({children, className}: SettingsMenuProps) {
    return (
        <aside className={cn("w-full lg:w-60 lg:shrink-0", className)}>
            <nav className="flex flex-row gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {children}
            </nav>
        </aside>
    );
}

interface SettingsMenuItemProps {
    href: string;
    label: string;
    icon?: IconKey;
    active?: boolean;
    onClick?: () => void;
}

function SettingsMenuItem({href, label, icon, active, onClick}: SettingsMenuItemProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = active ?? (
        pathname === href || (href !== "/beverage-sales/settings" && pathname.startsWith(href + "/"))
    );

    return (
        <Button
            variant={isActive ? "default" : "ghost"}
            size="lg"
            onClick={() => {
                onClick?.();
                router.push(href);
            }}
            className={cn(
                "justify-start gap-2 whitespace-nowrap rounded-lg px-3",
                "lg:w-full"
            )}
        >
            {icon && <DynamicIcon name={icon} size={4}/>}
            {label}
        </Button>
    );
}

interface SettingsContainerProps {
    children: React.ReactNode;
    className?: string;
}

function SettingsContainer({children, className}: SettingsContainerProps) {
    return (
        <div className={cn("flex-1 min-w-0", className)}>
            <div className="mx-auto w-full max-w-[1024px]">
                {children}
            </div>
        </div>
    );
}

interface SettingsHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

function SettingsHeader({title, description, actions, className}: SettingsHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", className)}>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {actions}
        </div>
    );
}

interface SettingsSectionProps {
    children: React.ReactNode;
    className?: string;
}

function SettingsSection({children, className}: SettingsSectionProps) {
    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {children}
        </div>
    );
}

SettingsLayout.Menu = SettingsMenu;
SettingsLayout.MenuItem = SettingsMenuItem;
SettingsLayout.Container = SettingsContainer;
SettingsLayout.Header = SettingsHeader;
SettingsLayout.Section = SettingsSection;

export {SettingsLayout};
