"use client"

import * as React from "react"
import {cn} from "@/core/infrastructure/utilities/utils"
import {useMemo, useId} from "react";
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

export interface LegacySelectInputProps extends React.ComponentProps<"div"> {
    label?: string;
    icon?: React.ReactNode;
    placeholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    options: { value: string; label: string }[];
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

const LegacySelectInput = React.forwardRef<HTMLDivElement, LegacySelectInputProps>(
    ({
         label,
         description,
         icon,
         className,
         id,
         color,
         placeholder,
         value,
         onValueChange,
         options,
         required,
         ...props
     }, ref) => {
        const reactId = useId();
        const _id = useMemo(() => id || label?.toLowerCase().replace(/ /g, '-') || reactId, [id, label, reactId]);

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
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                        <Select value={value || ''} onValueChange={onValueChange}>
                            <SelectTrigger
                                className="h-auto p-0 border-none bg-transparent! shadow-none! focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0 data-[placeholder]:text-muted-foreground/30 [&_[data-slot=select-value]]:text-sm [&_[data-slot=select-value]]:font-normal">
                                <SelectValue placeholder={placeholder}/>
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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

LegacySelectInput.displayName = "LegacySelectInput"

export {LegacySelectInput}
