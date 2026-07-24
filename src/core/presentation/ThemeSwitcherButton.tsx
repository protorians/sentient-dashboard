import {Button} from "@/core/presentation/ui/button";
import {MoonIcon, SunIcon} from "lucide-react";
import {useThemePreferColorSchemeStore} from "@/core/infrastructure/stores/theme.store";
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum";


export function ThemeSwitcherButton() {
    const {colorScheme, toggleColorScheme} = useThemePreferColorSchemeStore()
    return (
        <Button
            variant="ghost"
            onClick={() => toggleColorScheme(true)}
            className="w-8 h-8"
        >
            {colorScheme !== PreferColorSchemeEnum.Light ? <SunIcon/> : <MoonIcon/>}
        </Button>
    )
}