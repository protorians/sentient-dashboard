"use client"

import * as React from "react"
import {cn} from "@/core/infrastructure/utilities/utils"
import {useMemo, useId} from "react";

export type NestedInputColoring = 'error' | 'success' | 'warning' | 'info' | 'disabled' | 'ghost';

export interface NestedInputProps extends React.ComponentProps<"div"> {
    label: string;
    icon?: React.ReactNode;
    input?: React.ComponentProps<"input">;
    color?: NestedInputColoring
}

const coloringClassname: Record<NestedInputColoring, string> = {
    disabled: "bg-background/20 text-foreground-500 opacity-50",
    info: "!bg-primary/20 !text-primary !border-primary",
    success: "bg-green-500/20 text-green-500 !border-green-500",
    warning: "bg-yellow-500/20 text-yellow-500 !border-yellow-500",
    error: 'bg-red-800/20 text-red-800 !border-red-500',
    ghost: 'bg-transparent text-foreground',
}


const NestedInput = React.forwardRef<HTMLInputElement, NestedInputProps>(
    ({label, icon, className, id, input, color, ...props}, ref) => {
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
            <div {...props}
                 suppressHydrationWarning
                 className={cn(
                     "relative flex flex-col justify-center rounded-xl bg-background border border-border/30 px-4 py-2.5 text-left focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all w-full",
                     coloringClassname[color || 'ghost'] || ''
                 )}>
                <label
                    htmlFor={_id}
                    className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground select-none flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </label>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <input
                        ref={ref}
                        id={_id}
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        value={value}
                        onChange={onChange}
                        className={cn(
                            "w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/30",
                            inputClassName,
                            className,
                        )}
                        {...inputProps}
                    />
                    {icon && <div
                        className="text-muted-foreground select-none flex items-center justify-center shrink-0">{icon}</div>}
                </div>
            </div>
        )
    }
)

NestedInput.displayName = "NestedInput"

export {NestedInput}
