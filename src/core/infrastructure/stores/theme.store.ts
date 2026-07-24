"use client";

import {create} from "zustand";
import {getThemeCached, syncThemeCache} from "@/core/infrastructure/capabilities/theme.capability";
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum";
import {ThemeCacheInterface} from "@/core/domain/typing/theme-caches";

export interface ThemePreferColorSchemeStoreState {
    colorScheme: PreferColorSchemeEnum | undefined;
    preferSystem: boolean;
    toggleColorScheme: (persist?: boolean) => void;
    useSystem: (prefer: boolean) => void;
    setColorScheme: (theme: PreferColorSchemeEnum) => void;
    initialize: () => Promise<ThemeCacheInterface>;
}

const presetPreferColorSchemes = Object.values(PreferColorSchemeEnum)

const getTargetElement = () => {
    return presetPreferColorSchemes
        .filter((scheme) => document.querySelector("body")?.classList.contains(scheme))
        .pop() ? document.querySelector("body") : document.documentElement;
};

export const useThemePreferColorSchemeStore = create<ThemePreferColorSchemeStoreState>(set => ({
    colorScheme: undefined,
    preferSystem: false,
    useSystem: async (preferSystem: boolean) => {
        await syncThemeCache('preferSystem', preferSystem)
        return set({preferSystem: preferSystem})
    },
    toggleColorScheme: async (persist: boolean = true) => {
        const body = getTargetElement();
        if (body) {
            const current = body.classList.contains(PreferColorSchemeEnum.Dark)
                ? PreferColorSchemeEnum.Dark
                : PreferColorSchemeEnum.Light;

            const getColorScheme = current == PreferColorSchemeEnum.Light
                ? PreferColorSchemeEnum.Dark
                : PreferColorSchemeEnum.Light;

            body.classList.remove(PreferColorSchemeEnum.Light, PreferColorSchemeEnum.Dark);
            body.classList.add(getColorScheme);

            if (persist)
                await syncThemeCache('colorScheme', getColorScheme)

            return set({colorScheme: getColorScheme})
        }
    },
    setColorScheme: async (colorScheme: PreferColorSchemeEnum) => {
        const body = getTargetElement();
        if (body) {
            body.classList.remove(PreferColorSchemeEnum.Light, PreferColorSchemeEnum.Dark);
            body.classList.add(colorScheme);
        }
        await syncThemeCache('colorScheme', colorScheme)
        return set({colorScheme: colorScheme});
    },
    initialize: async () => await getThemeCached()
}));