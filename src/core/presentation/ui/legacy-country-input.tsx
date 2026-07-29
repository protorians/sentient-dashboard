"use client"

import * as React from "react"
import {cn} from "@/core/infrastructure/utilities/utils"
import {useMemo, useId, useState} from "react";
import {countriesConstant, CountryInterface} from "@/core/domain/constants/countries.constant";
import {
    InputGroup,
    InputGroupAddon
} from "@/core/presentation/ui/input-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/core/presentation/ui/select"
import type {LegacyInputColoring} from "@/core/presentation/ui/legacy-input"
import {Field, FieldDescription} from "@/core/presentation/ui/field";

export interface LegacyCountryInputProps extends React.ComponentProps<"div"> {
    label?: string;
    icon?: React.ReactNode;
    placeholder?: string;
    value?: string;
    defaultCountryCode?: string;
    onValueChange?: (value: string) => void;
    onCountryChange?: (country: CountryInterface) => void;
    color?: LegacyInputColoring;
    required?: boolean;
    description?: React.ReactNode;
}

const coloringClassname: Record<LegacyInputColoring, string> = {
    disabled: "bg-background/20 text-foreground-500 opacity-50",
    info: "!bg-primary/20 !text-primary !border-primary",
    success: "bg-green-500/20 text-green-500 !border-green-500",
    warning: "bg-yellow-500/20 text-yellow-500 !border-yellow-500",
    error: 'bg-red-800/20 text-red-800 !border-red-500',
    ghost: 'bg-transparent text-foreground',
}

const LegacyCountryInput = React.forwardRef<HTMLDivElement, LegacyCountryInputProps>(
    ({
         label,
         description,
         icon,
         className,
         id,
         color,
         placeholder = "Sélectionner un pays",
         value: valueProp,
         defaultCountryCode: defaultCountryCodeProp,
         onValueChange,
         onCountryChange,
         required,
         ...props
     }, ref) => {
        const reactId = useId();
        const _id = useMemo(() => id || label?.toLowerCase().replace(/ /g, '-') || reactId, [id, label, reactId]);

        const sortedCountries = useMemo(() => {
            return [...countriesConstant].sort((a, b) => a.name.localeCompare(b.name));
        }, []);

        const defaultCountryCode = useMemo(() => {
            if (defaultCountryCodeProp) return defaultCountryCodeProp;

            if (typeof window === 'undefined') return 'CI';

            try {
                const locale = navigator.language;
                const parts = locale.split('-');
                const region = parts[parts.length - 1].toUpperCase();
                if (region.length === 2 && countriesConstant.some(c => c.code === region)) {
                    return region;
                }
            } catch {}

            return 'CI';
        }, [defaultCountryCodeProp]);

        const [internalValue, setInternalValue] = useState(defaultCountryCode);
        const value = valueProp ?? internalValue;

        const selectedCountry = useMemo(() => {
            if (!value) return undefined;
            return sortedCountries.find(c => c.code === value);
        }, [value, sortedCountries]);

        const handleValueChange = (countryCode: string) => {
            setInternalValue(countryCode);
            onValueChange?.(countryCode);
            const country = sortedCountries.find(c => c.code === countryCode);
            if (country) {
                onCountryChange?.(country);
            }
        };

        return (
            <Field>
                <InputGroup
                    {...props}
                    suppressHydrationWarning
                    className={cn(
                        "h-auto flex-col items-stretch rounded-md bg-background px-4 py-2.5",
                        coloringClassname[color || 'ghost'] || '',
                        className
                    )}
                >
                    {label && (
                        <InputGroupAddon
                            align="block-start"
                            className="px-0 py-0 text-[10px] uppercase font-bold tracking-wider text-muted-foreground select-none"
                        >
                            {label}
                            {required && <span className="text-destructive">*</span>}
                        </InputGroupAddon>
                    )}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                        <Select value={value || ''} onValueChange={handleValueChange}>
                            <SelectTrigger
                                className="h-auto p-0 border-none bg-transparent! shadow-none! focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0 data-[placeholder]:text-muted-foreground/30 [&_[data-slot=select-value]]:text-sm [&_[data-slot=select-value]]:font-normal">
                                <SelectValue placeholder={placeholder}>
                                    {selectedCountry && (
                                        <div className="flex items-center gap-1.5 text-sm font-medium">
                                            <span className="text-base">{selectedCountry.flag}</span>
                                            <span>{selectedCountry.name}</span>
                                            {/*<span className="text-muted-foreground ml-auto">{selectedCountry.dialCode}</span>*/}
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-80">
                                {sortedCountries.map((country) => (
                                    <SelectItem key={country.code} value={country.code} className="cursor-pointer">
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="text-base">{country.flag}</span>
                                            <span className="truncate flex-1">{country.name}</span>
                                            <span className="text-muted-foreground text-xs">{country.dialCode}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {icon && <InputGroupAddon
                            align="inline-end"
                            className="text-muted-foreground select-none px-0"
                        >
                            {icon}
                        </InputGroupAddon>}
                    </div>
                </InputGroup>
                {description && <FieldDescription className="mt-1">{description}</FieldDescription>}
            </Field>
        )
    }
)

LegacyCountryInput.displayName = "LegacyCountryInput"

export {LegacyCountryInput}
