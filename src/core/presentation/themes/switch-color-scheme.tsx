"use client";


import {FaIcon, FaTypeEnum} from "@/core/presentation/icons/glyphIcons";
import {Button} from "@/core/presentation/ui/button";
import {useThemePreferColorSchemeStore} from "@/core/infrastructure/stores/theme.store";

export function SwitchColorScheme() {
    const {toggleColorScheme} = useThemePreferColorSchemeStore()

    return (
        <Button variant={"ghost"} className={"px-3"} onClick={() => toggleColorScheme(true)}>
            <FaIcon type={FaTypeEnum.Solid} name="eclipse"/>
        </Button>
    )
}