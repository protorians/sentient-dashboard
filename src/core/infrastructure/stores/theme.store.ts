"use client";

import {create} from "zustand";
import {syncThemeCache} from "@/core/infrastructure/capabilities/theme.capability";
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum";

export interface ThemePreferColorSchemeStoreState {
    colorScheme: PreferColorSchemeEnum|undefined;
    preferSystem: boolean;
    toggleColorScheme: (persist?: boolean) => void;
    useSystem: (prefer: boolean) => void;
    setColorScheme: (theme: PreferColorSchemeEnum) => void;
}

export const useThemePreferColorSchemeStore = create<ThemePreferColorSchemeStoreState>(set => ({
    colorScheme: undefined,
    preferSystem: false,
    useSystem: (preferSystem: boolean) => {
        syncThemeCache('preferSystem', preferSystem)
        return set({preferSystem: preferSystem})
    },
    toggleColorScheme: (persist: boolean = true) => {
        const body = document.querySelector("body");
        if (body) {
            const current = body.classList.contains(PreferColorSchemeEnum.Light)
                ? PreferColorSchemeEnum.Light
                : PreferColorSchemeEnum.Dark;

            const colorScheme = current == PreferColorSchemeEnum.Light
                ? PreferColorSchemeEnum.Dark
                : PreferColorSchemeEnum.Light;

            body.classList.remove(PreferColorSchemeEnum.Light, PreferColorSchemeEnum.Dark);
            body.classList.add(colorScheme);
            syncThemeCache('colorScheme', colorScheme)

            if (persist) {
                syncThemeCache('preferSystem', !persist)
                set({colorScheme: colorScheme, preferSystem: !persist})
            }
        }
    },
    setColorScheme: (colorScheme: PreferColorSchemeEnum) => {
        const body = document.querySelector("body");
        if (body) {
            body.classList.remove(PreferColorSchemeEnum.Light, PreferColorSchemeEnum.Dark);
            body.classList.add(colorScheme);
        }
        syncThemeCache('colorScheme', colorScheme)
        return set({colorScheme: colorScheme});
    },
}));