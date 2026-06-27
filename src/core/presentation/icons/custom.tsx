import {IconKey, IIconCustomProps} from "@/core/presentation/icons/types";
import {Fragment} from "react";
import {LucideIcon} from "@/core/presentation/icons/lucide";
import {RemixIcon} from "@/core/presentation/icons/remix";
import {IconProviderEnum} from "@/core/domain/enums/icons.enum";



export function CustomIcon({provider = IconProviderEnum.LUCIDE, name, ...props}: IIconCustomProps) {
    return <Fragment>
        {!provider || provider === IconProviderEnum.LUCIDE
            ? <LucideIcon {...props} name={name as IconKey}/>
            : null
        }
        {provider === IconProviderEnum.REMIX
            ? <RemixIcon {...props} name={name as IconKey}/>
            : null
        }
    </Fragment>
}