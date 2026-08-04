import {HTMLAttributes} from "react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {ExternalLinkIcon} from "lucide-react";

export type ClickableSizeIcon = "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_ICON_CLASS: Record<ClickableSizeIcon, string> = {
    "3xs": "h-3 w-3",
    "2xs": "h-3.5 w-3.5",
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
    "2xl": "h-12 w-12",
};

export interface ClickableProps extends HTMLAttributes<HTMLButtonElement> {
    onClick: () => void;
    sizeIcon?: ClickableSizeIcon;
}

export function Clickable(props: ClickableProps) {
    const sizeIcon = props.sizeIcon || 'xs';

    return <button {...props} className={cn(
        "items-center gap-2",
        props.className,
        "bg-transparent hover:text-primary flex flex-row cursor-pointer p-0!"
    )}>
        {props.children}
        {sizeIcon && <ExternalLinkIcon strokeWidth={1} className={SIZE_ICON_CLASS[sizeIcon]}/>}
    </button>;
}