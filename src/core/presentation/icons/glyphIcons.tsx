import {cn} from "@/core/infrastructure/utilities/utils";
import React from "react";
import {camelCase} from "@/core/infrastructure/utilities/strings.util";

export enum FaTypeEnum {
    Solid = 'fas',
    Regular = 'far',
    Brands = 'fab',
    Light = 'fal',
    Duotone = 'fad',
    SharpRegular = 'fa-sharp fa-regular',
    SharpSolid = 'fa-sharp fa-solid',
    SharpLight = 'fa-sharp fa-light',
    SharpDuotoneSolid = 'fa-sharp-duotone fa-solid',
    SharpDuotoneRegular = 'fa-sharp-duotone fa-regular',
    SharpDuotoneLight = 'fa-sharp-duotone fa-light',
    SharpDuotoneThin = 'fa-sharp-duotone fa-thin',
    BoldRounded = 'fi fi-br',
    SolidRounded = 'fi fi-sr',
    RegularRounded = 'fi fi-rr',
}

export enum FaSizeEnum {
    x1 = 1,
    x2 = 2,
    x3 = 3,
    x4 = 4,
    x5 = 5,
    x6 = 6,
    x7 = 7,
    x8 = 8,
    x9 = 9,
    x10 = 10,
}

export interface FaIconProps extends React.HTMLProps<HTMLSpanElement>{
    type?: FaTypeEnum;
    name: string;
    size?: FaSizeEnum;
}

export function FaIcon({type, name, size, className, ...props}: FaIconProps) {
    const _type = type ? type.toString().trim() : 'fas';
    const isFa = _type.substring(0, 2) === 'fa';

    return (
        <i {...props} className={cn(
            'animate-zoom-in',
            className,
            `${isFa ? _type : ''} ${isFa ? 'fa-': `${type}-`}${camelCase(name)} ${(size ? `fa-${size}x` : 'fa-lg')}`,
        )}></i>
    )
}