import {IStringablePartialExtended} from "@/core/domain/typing/values";


export function stringable(value: IStringablePartialExtended): string | null {
    if (!value) return null;
    switch (typeof value) {
        case 'object':
            return JSON.stringify(value);
        default:
            return value as string;
    }
}

export function isStringable(value: IStringablePartialExtended) {
    return !!stringable(value)
}
