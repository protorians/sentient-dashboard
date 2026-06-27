import Icons from "lucide-react";
import React from "react";
import {IconProviderEnum} from "@/core/domain/enums/icons.enum";

export type IconKey = keyof typeof Icons;

export interface IIconProps extends React.ComponentProps<'i'> {
    name: IconKey | string;
    size?: number;
    color?: string;
}

export interface IIconExtendedProps extends IIconProps {
    variant?: 'Fill' | 'Line';
}

export interface IIconCustomProps extends IIconExtendedProps {
    provider?: IconProviderEnum;
}

export interface IPagesIcons {
    default: string;
    create: string;
    read: string;
    update: string;
    delete: string;
}
