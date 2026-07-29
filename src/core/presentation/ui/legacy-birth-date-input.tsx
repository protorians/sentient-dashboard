"use client"

import * as React from "react"
import {useMemo} from "react";
import {LegacyInput, type LegacyInputProps} from "@/core/presentation/ui/legacy-input";
import {CalendarIcon} from "lucide-react";

export interface LegacyBirthDateInputProps extends Omit<LegacyInputProps, 'input'> {
    minAge?: number;
    input?: Omit<React.ComponentProps<"input">, 'type' | 'max'>;
}

const LegacyBirthDateInput = React.forwardRef<HTMLInputElement, LegacyBirthDateInputProps>(
    ({minAge = 18, input, ...props}, ref) => {
        const maxDate = useMemo(() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - minAge);
            return date.toISOString().split('T')[0];
        }, [minAge]);

        props = props || {};
        props.id = props.id || 'birthDate';
        props.label = props.label || 'Date de naissance';
        props.description = props.description || `Utilisée pour vérifier l'éligibilité et la sécurité du compte. L'âge minimum requit de ${minAge} an${minAge > 1 ? 's' : ''}`;
        props.icon = props.icon || (<CalendarIcon className="size-4 text-muted-foreground/60"/>);

        return (
            <LegacyInput
                ref={ref}
                input={{
                    ...input,
                    type: "date",
                    max: maxDate,
                }}
                {...props}
            />
        )
    }
);

LegacyBirthDateInput.displayName = "LegacyBirthDateInput";

export {LegacyBirthDateInput};
