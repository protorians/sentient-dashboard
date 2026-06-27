export type ThemeLogoColorVariant = 'normal' | 'white' | 'black';
export type ThemeLogoVariant = 'icon' | 'banner' | 'square';

export interface ThemeLogoProps {
    size?: number;
    variant?: ThemeLogoVariant;
    color?: ThemeLogoColorVariant;
    onDark?: ThemeLogoColorVariant;
    className?: string;
}