"use client";

import {useEffect, useState} from "react";
import {useThemePreferColorSchemeStore} from "@/core/infrastructure/stores/theme.store";
import {ThemeCacheInterface} from "@/core/domain/typing/theme-caches";


export function ThemeProvider() {
    const {setColorScheme, initialize} = useThemePreferColorSchemeStore()
    const [theme, setTheme] = useState<ThemeCacheInterface | undefined>(undefined)

    useEffect(() => {
        initialize().then((theme) => setTheme(theme))
    }, []);

    useEffect(() => {
        if (theme && theme.colorScheme)
            setColorScheme(theme.colorScheme)
    }, [theme]);

    return null;
}