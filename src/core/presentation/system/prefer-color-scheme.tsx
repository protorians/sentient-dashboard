"use client";

import {useEffect} from "react";
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum";
import {useThemePreferColorSchemeStore} from "@/core/infrastructure/stores/theme.store";

export function ThemePreferColorSchemeProvider() {
    const setColorScheme = useThemePreferColorSchemeStore((state) => state.setColorScheme);
    const initialize = useThemePreferColorSchemeStore((state) => state.initialize);

    useEffect(() => {
        let disposed = false;
        let mediaQuery: MediaQueryList | null = null;
        let changed: ((event: MediaQueryListEvent) => void) | null = null;
        let preferSystem = false;

        initialize().then((cached) => {
            if (disposed) return;

            const state = useThemePreferColorSchemeStore.getState();
            preferSystem = cached.preferSystem ?? state.preferSystem;
            const _colorScheme = cached.colorScheme ?? state.colorScheme ?? PreferColorSchemeEnum.Light;

            mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

            const applySystem = (matches: boolean) =>
                setColorScheme(matches ? PreferColorSchemeEnum.Dark : PreferColorSchemeEnum.Light);

            if (preferSystem) {
                applySystem(mediaQuery.matches);
            } else {
                setColorScheme(_colorScheme);
            }

            changed = (event: MediaQueryListEvent) => {
                if (preferSystem) applySystem(event.matches);
            };

            mediaQuery.addEventListener("change", changed);
        });

        return () => {
            disposed = true;
            if (mediaQuery && changed) mediaQuery.removeEventListener("change", changed);
        };
    }, [initialize, setColorScheme]);

    return null;
}
