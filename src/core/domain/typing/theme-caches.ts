import {StackableEntityType} from "@/core/infrastructure/capabilities/stackable/types";
import {PreferColorSchemeEnum} from "@/core/domain/enums/theme.enum";

export interface ThemeCacheInterface extends StackableEntityType{
    colorScheme?: PreferColorSchemeEnum;
    preferSystem?: boolean;
}