"use client";

import {IconKey, IIconProps} from "@/core/presentation/icons/types";
import * as Icons from "lucide-react";
import React from "react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {kebabToPascalCase} from "@/core/infrastructure/utilities/strings";

export function LucideIcon({name, size = 16, color = "currentColor", className}: IIconProps) {
    name = kebabToPascalCase<IconKey>(name)
    const Icon = Icons[name as IconKey] as React.ForwardRefExoticComponent<any>;
    if(!Icon) return null;
    return <Icon className={cn(
        className,
        `size-${size}`
    )} color={color} />;
}
