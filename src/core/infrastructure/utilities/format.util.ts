export function formatFileSize(bytes: number): string {
    if (isNaN(bytes) || bytes === null || typeof bytes === 'undefined') return '0 o';
    const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i++;
    }
    const decimals = i === 0 ? 0 : value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return `${value.toFixed(decimals)} ${units[i]}`;
}

export function formatBytesPerSecond(bytesPerSecond: number): string {
    return `${formatFileSize(bytesPerSecond)}/s`;
}

export function formatEta(seconds: number | null | undefined): string {
    if (!seconds || isNaN(seconds) || seconds <= 0 || !isFinite(seconds)) return '—';
    if (seconds < 60) return `${Math.ceil(seconds)}s restantes`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (minutes < 60) return `${minutes}m ${secs}s restantes`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m restantes`;
}

export function formatDuration(seconds: number | null | undefined): string {
    if (!seconds || isNaN(seconds) || seconds <= 0 || !isFinite(seconds)) return '—';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (minutes < 60) return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${(minutes % 60).toString().padStart(2, '0')}m`;
}
