import {Fragment} from "react";
import {ThemeLogoProps} from "@/core/presentation/themes/types";
import {cn} from "@/core/infrastructure/utilities/utils";
import {LogoConfig} from "@/core/domain/config/logo.config";
import {AppConfig} from "@/core/domain/config/app.config";


export function ThemeLogo({size, className, color, onDark, variant}: ThemeLogoProps) {
    const _size = size ? `w-${size}` : '';
    const _variant = variant || 'banner';

    return (
        <Fragment>
            <img src={LogoConfig[_variant][color || 'normal']}
                 className={cn("dark:hidden w-50 h-auto object-contain", _size, className)} alt={AppConfig.APP_NAME}/>
            <img src={LogoConfig[_variant][onDark || 'white']}
                 className={cn("dark:block hidden w-50 h-auto object-contain", _size, className)}
                 alt={AppConfig.APP_NAME}/>
        </Fragment>
    )
}