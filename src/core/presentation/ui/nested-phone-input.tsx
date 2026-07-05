"use client"

import * as React from "react"
import {cn} from "@/core/infrastructure/utilities/utils"
import {useMemo, useId, useState, useEffect} from "react";
import {countries, Country} from "@/core/domain/constants/countries";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/core/presentation/ui/select";

export type NestedPhoneInputColoring = 'error' | 'success' | 'warning' | 'info' | 'disabled' | 'ghost';

export interface NestedPhoneInputProps extends Omit<React.ComponentProps<"div">, 'onChange'> {
    label: string;
    value?: string;
    onChange?: (value: string) => void;
    onCountryChange?: (country: Country) => void;
    defaultCountryCode?: string;
    input?: React.ComponentProps<"input">;
    color?: NestedPhoneInputColoring;
}

const coloringClassname: Record<NestedPhoneInputColoring, string> = {
    disabled: "bg-background/20 text-foreground-500 opacity-50",
    info: "!bg-primary/20 !text-primary !border-primary",
    success: "bg-green-500/20 text-green-500 !border-green-500",
    warning: "bg-yellow-500/20 text-yellow-500 !border-yellow-500",
    error: 'bg-red-800/20 text-red-800 !border-red-500',
    ghost: 'bg-transparent text-foreground',
}

const NestedPhoneInput = React.forwardRef<HTMLInputElement, NestedPhoneInputProps>(
    ({label, className, id, input, color, value, onChange, onCountryChange, defaultCountryCode = "FR", ...props}, ref) => {
        const reactId = useId();
        const _id = useMemo(() => id || label?.toLowerCase().replace(/ /g, '-') || reactId, [id, label, reactId]);

        // Sort countries alphabetically
        const sortedCountries = useMemo(() => {
            return [...countries].sort((a, b) => a.name.localeCompare(b.name));
        }, []);

        // Find initial country
        const initialCountry = useMemo(() => {
            return sortedCountries.find(c => c.code === defaultCountryCode) || sortedCountries[0];
        }, [defaultCountryCode, sortedCountries]);

        const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry);
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
                onChange?.(`${country.dialCode}${phoneNumber}`);
            }
        };

        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newPhone = e.target.value.replace(/[^\d\s-()]/g, "");
            setPhoneNumber(newPhone);
            onChange?.(`${selectedCountry.dialCode}${newPhone}`);
        };

        const {
            type = "tel",
            placeholder,
            required,
            className: inputClassName,
            ...inputProps
        } = input || {};

        return (
            <div {...props}
                 suppressHydrationWarning
                 className={cn(
                     "relative flex flex-col justify-center rounded-xl bg-background border border-border/30 px-4 py-2.5 text-left focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all w-full",
                     coloringClassname[color || 'ghost'] || '',
                     className
                 )}>
                <label
                    htmlFor={_id}
                    className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground select-none flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                    <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
                        <SelectTrigger className="h-auto p-0 pr-1 border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-fit min-w-0 data-[placeholder]:text-foreground">
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
                                        <span className="text-muted-foreground text-xs">{country.dialCode}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <div className="w-px h-4 bg-border/50 mx-1" />

                    <input
                        ref={ref}
                        id={_id}
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        className={cn(
                            "flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/30",
                            inputClassName,
                        )}
                        {...inputProps}
                    />
                </div>
            </div>
        )
    }
)

NestedPhoneInput.displayName = "NestedPhoneInput"

export {NestedPhoneInput}
