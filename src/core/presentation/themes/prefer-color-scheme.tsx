"use client";

import {useEffect} from "react";
import {getThemeCached} from "@/core/infrastructure/capabilities/theme.capability";
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum";
import {useThemePreferColorSchemeStore} from "@/core/infrastructure/stores/theme.store";

export function ThemePreferColorScheme() {
    const {colorScheme, preferSystem, useSystem, setColorScheme} = useThemePreferColorSchemeStore()

    useEffect(() => {
        const cached = getThemeCached()
        const _preferSystem = (typeof cached.preferSystem !== 'undefined') ? cached.preferSystem : preferSystem;
        const _colorScheme = colorScheme || cached.colorScheme || PreferColorSchemeEnum.Light;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        if (_preferSystem)
            setColorScheme(mediaQuery.matches ? PreferColorSchemeEnum.Dark : PreferColorSchemeEnum.Light)

        if (!_preferSystem && Object.values(PreferColorSchemeEnum).includes(_colorScheme as PreferColorSchemeEnum))
            setColorScheme(_colorScheme as PreferColorSchemeEnum);

        const changed = (event?: MediaQueryListEvent) => {
            if (_preferSystem) {
                setColorScheme(event?.matches ? PreferColorSchemeEnum.Dark : PreferColorSchemeEnum.Light);
                useSystem(true);
            } else if (Object.values(PreferColorSchemeEnum).includes(_colorScheme)) {
                setColorScheme(_colorScheme);
                useSystem(false);
            }
        };

        mediaQuery.addEventListener("change", changed);
        return () => {
            mediaQuery.removeEventListener("change", changed);
        };
    }, [])

    return null;
}