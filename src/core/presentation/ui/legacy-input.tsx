"use client"

import * as React from "react"
import {cn} from "@/core/infrastructure/utilities/utils"
import {useMemo, useId} from "react";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon
} from "@/core/presentation/ui/input-group"
import {FieldDescription, Field} from "@/core/presentation/ui/field"

export type LegacyInputColoring = 'error' | 'success' | 'warning' | 'info' | 'disabled' | 'ghost';

export interface LegacyInputProps extends React.ComponentProps<"div"> {
    label?: string;
    icon?: React.ReactNode;
    input?: React.ComponentProps<"input">;
    color?: LegacyInputColoring;
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


const LegacyInput = React.forwardRef<HTMLInputElement, LegacyInputProps>(
    ({label, icon, className, id, input, color, description, ...props}, ref) => {
        const reactId = useId();
        const _id = useMemo(() => id || label?.toLowerCase().replace(/ /g, '-') || reactId, [id, label, reactId]);

        const {
            type,
            placeholder,
            required,
            value,
            onChange,
            className: inputClassName,
            ...inputProps
        } = input || {};

        return (
            <Field>
                <InputGroup
                    {...props}
                    suppressHydrationWarning
                    className={cn(
                        "h-auto flex-col items-stretch rounded-md bg-background  px-4 py-2.5",
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
                        <InputGroupInput
                            ref={ref}
                            id={_id}
                            type={type}
                            placeholder={placeholder}
                            required={required}
                            value={value}
                            onChange={onChange}
                            className={cn(
                                "text-sm placeholder:text-muted-foreground/30 ",
                                inputClassName,
                            )}
                            {...inputProps}
                        />
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

LegacyInput.displayName = "LegacyInput"

export {LegacyInput}
