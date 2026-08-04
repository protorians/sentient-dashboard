export function getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
        return current?.[key];
    }, obj);
}