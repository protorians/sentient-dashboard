"use client";

import {IconKey, IIconExtendedProps} from "@/core/presentation/icons/types";
import * as Icons from "@remixicon/react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {kebabToPascalCase} from "@/core/infrastructure/utilities/strings.util";
import {toIconKey} from "@/core/infrastructure/utilities/icons";


export function RemixIcon({name, size = 3, color = "currentColor", variant = 'Line', className}: IIconExtendedProps) {

    name = toIconKey(
        name.startsWith('ri-')
            ? name.replace('ri-', '')
            : name
    );
    name = toIconKey(
        name.endsWith('-line')
            ? name.replace('-line', '')
            : name
    );

    name = toIconKey(
        name.endsWith('-fill')
            ? name.replace('-fill', '')
            : name
    );

    name = kebabToPascalCase<IconKey>(`ri-${name}-${variant}`)
    const Icon = Icons[name as keyof typeof Icons] as React.ForwardRefExoticComponent<any>;
    if (!Icon) return null;
    return <Icon className={cn(className, `size-${size}`)} color={color}/>;
}
