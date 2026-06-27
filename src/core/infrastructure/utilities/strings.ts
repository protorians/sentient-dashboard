export function kebabToPascalCase<T extends string>(str: string): T {
    return str.toString()
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("") as T;
}

export function camelCase(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function unCamelCase(str: string) { return str.replace(/([A-Z])/g, ' $1').trim(); }

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const toTitleCase = (str: string) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
