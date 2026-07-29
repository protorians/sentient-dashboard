"use client"

import * as React from "react"
import {cn} from "@/core/infrastructure/utilities/utils"
import {useMemo, useId, useState, useEffect} from "react";
import {countriesConstant, CountryInterface} from "@/core/domain/constants/countries.constant";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/core/presentation/ui/select";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon
} from "@/core/presentation/ui/input-group"
import {Field, FieldDescription} from "@/core/presentation/ui/field";

export type LegacyPhoneInputColoring = 'error' | 'success' | 'warning' | 'info' | 'disabled' | 'ghost';

export interface LegacyPhoneInputProps extends Omit<React.ComponentProps<"div">, 'onChange'> {
    label: string;
    value?: string;
    onChange?: (value: string, prefix: string, rawNumber: string) => void;
    onCountryChange?: (country: CountryInterface) => void;
    defaultCountryCode?: string;
    input?: React.ComponentProps<"input">;
    color?: LegacyPhoneInputColoring;
    description?: React.ReactNode;
}

const coloringClassname: Record<LegacyPhoneInputColoring, string> = {
    disabled: "bg-background/20 text-foreground-500 opacity-50",
    info: "!bg-primary/20 !text-primary !border-primary",
    success: "bg-green-500/20 text-green-500 !border-green-500",
    warning: "bg-yellow-500/20 text-yellow-500 !border-yellow-500",
    error: 'bg-red-800/20 text-red-800 !border-red-500',
    ghost: 'bg-transparent text-foreground',
}

const LegacyPhoneInput = React.forwardRef<HTMLInputElement, LegacyPhoneInputProps>(
    ({
         label,
        description,
         className,
         id,
         input,
         color,
         value,
         onChange,
         onCountryChange,
         defaultCountryCode: defaultCountryCodeProp,
         ...props
     }, ref) => {
        const reactId = useId();
        const _id = useMemo(() => id || label?.toLowerCase().replace(/ /g, '-') || reactId, [id, label, reactId]);

        // Sort countries alphabetically
        const sortedCountries = useMemo(() => {
            return [...countriesConstant].sort((a, b) => a.name.localeCompare(b.name));
        }, []);

        // Detect user's country from browser locale, fallback to Côte d'Ivoire (+225)
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

        // Find initial country
        const initialCountry = useMemo(() => {
            return sortedCountries.find(c => c.code === defaultCountryCode) || sortedCountries[0];
        }, [defaultCountryCode, sortedCountries]);

        const [selectedCountry, setSelectedCountry] = useState<CountryInterface>(initialCountry);
        const [phoneNumber, setPhoneNumber] = useState("");

        // Synchronize with external value
        useEffect(() => {
            if (value !== undefined && value !== `${selectedCountry.dialCode}${phoneNumber}`) {
                // If value is provided externally, try to extract country and number
                const matchingCountry = sortedCountries
                    .filter(c => value.startsWith(c.dialCode))
                    // Sort by dialCode length descending to match longest prefix first (e.g. +1 242 vs +1)
                    .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];

                if (matchingCountry) {
                    setSelectedCountry(matchingCountry);
                    setPhoneNumber(value.slice(matchingCountry.dialCode.length).trim());
                } else {
                    // Fallback if no country matches prefix
                    setPhoneNumber(value);
                }
            }
        }, [value, sortedCountries, selectedCountry.dialCode, phoneNumber]);

        const handleCountryChange = (countryCode: string) => {
            const country = sortedCountries.find(c => c.code === countryCode);
            if (country) {
                setSelectedCountry(country);
                onCountryChange?.(country);
                onChange?.(`${country.dialCode}${phoneNumber}`, country.dialCode, phoneNumber);
            }
        };

        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newPhone = e.target.value.replace(/[^\d\s-()]/g, "");
            setPhoneNumber(newPhone);
            onChange?.(`${selectedCountry.dialCode}${newPhone}`, selectedCountry.dialCode, newPhone);
        };

        const {
            type = "tel",
            placeholder,
            required,
            className: inputClassName,
            ...inputProps
        } = input || {};

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
                    <InputGroupAddon
                        align="block-start"
                        className="px-0 py-0 text-[10px] uppercase font-bold tracking-wider text-muted-foreground select-none"
                    >
                        {label}
                        {required && <span className="text-destructive">*</span>}
                    </InputGroupAddon>
                    <div className="flex items-center gap-2 mt-0.5">
                        <InputGroupAddon align="inline-start" className="px-0">
                            <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
                                <SelectTrigger
                                    className="h-auto p-0 pr-1 border-none bg-transparent! shadow-none! focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-fit min-w-0 data-[placeholder]:text-foreground">
                                    <SelectValue>
                                        <div className="flex items-center gap-1.5 text-sm font-medium">
                                            <span className="text-base">{selectedCountry.flag}</span>
                                            <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-80 w-64">
                                    {sortedCountries.map((country) => (
                                        <SelectItem key={country.code} value={country.code} className="cursor-pointer">
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="text-base">{country.flag}</span>
                                                <span className="truncate flex-1">{country.name}</span>
                                                <span
                                                    className="text-muted-foreground text-xs">{country.dialCode}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </InputGroupAddon>

                        <div className="w-px h-4 bg-border/50 mx-1"/>

                        <InputGroupInput
                            ref={ref}
                            id={_id}
                            type={type}
                            placeholder={placeholder}
                            required={required}
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            className={cn(
                                "text-sm placeholder:text-muted-foreground/30",
                                inputClassName,
                            )}
                            {...inputProps}
                        />
                    </div>
                </InputGroup>
                {description && <FieldDescription className="mt-1">{description}</FieldDescription>}
            </Field>
        )
    }
)

LegacyPhoneInput.displayName = "LegacyPhoneInput"

export {LegacyPhoneInput}
