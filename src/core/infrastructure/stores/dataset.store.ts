"use client"

import * as React from "react";
import { create } from "zustand";
import { toast } from "sonner";

export type DatesetPayload<T> = {
    value: T;
    required?: boolean;
    key?: string;
}

export type DatesetEntity<T> = Record<keyof T, DatesetPayload<T[keyof T]>>

export type Validator<T> = (value: T) => string | null | undefined | boolean

export interface Dataset<T extends Object> {
    dataset: T;
    clear: () => void;
    consolidate: () => T;
    getter: <K extends keyof T>(key: K) => (T[K]) | undefined;
    remove: <K extends keyof T>(key: K) => void;
    setter: <K extends keyof T>(key: K, value: T[K]|undefined) => void;
    setMany: (data: Partial<T>) => void;
    validate: () => { valid: boolean; errors: Record<string, string> };
    ensureValidAndToast: (mode?: "single" | "multiple" | "rich") => boolean;
}

export function createDataset<T extends Object>(defaultValues?: T, validators?: Partial<Record<keyof T, Validator<any>>>) {
    return create<Dataset<T>>((setState, getState) => ({
        dataset: defaultValues || {} as T,
        clear() {
            setState({
                dataset: {} as T
            })
        },
        consolidate() {
            const state = getState() as any;
            // appeler la validation et afficher les erreurs via toast riche si nécessaire
            if (typeof state.ensureValidAndToast === "function") {
                state.ensureValidAndToast('rich');
            }
            return state.dataset || {};
        },
        getter<K extends keyof T>(key: K): (T[K]) | undefined {
            return getState().dataset[key] || undefined;
        },
        remove<K extends keyof T>(key: K) {
            const dataset: T = {} as T;
            for (const [k, value] of Object.entries(getState().dataset)) {
                if (k !== (key as string)) {
                    (dataset as any)[k] = value as any;
                }
            }
            return setState({dataset});
        },
        setter<K extends keyof T>(key: K, value: T[K]|undefined) {
            return setState({dataset: {...getState().dataset, [key]: value}})
        },
        setMany(data: Partial<T>) {
            setState({dataset: {...getState().dataset, ...data}})
        },
        validate() {
            const errors: Record<string, string> = {};
            if (validators) {
                for (const [k, fn] of Object.entries(validators as Record<string, Validator<any>>)) {
                    try {
                        const value = (getState().dataset as any)[k];
                        const res = fn?.(value);
                        if (typeof res === "string" && res.length) errors[k] = res;
                        else if (res === false) errors[k] = "Invalid value";
                    } catch (err) {
                        errors[k] = "Validation failed";
                    }
                }
            }
            return { valid: Object.keys(errors).length === 0, errors };
        },
        ensureValidAndToast(mode: "single" | "multiple" | "rich" = "single") {
            const result = (getState() as any).validate() as { valid: boolean; errors: Record<string, string> };
            if (!result.valid) {
                if (mode === "multiple") {
                    for (const [k, m] of Object.entries(result.errors)) {
                        toast.error(`${k}: ${m}`);
                    }
                } else if (mode === "rich") {
                    const items = Object.entries(result.errors).map(([k, m]) => React.createElement('li', { key: k }, `${k}: ${m}`));
                    const content = React.createElement(
                        'div',
                        { style: { padding: 0 } },
                        React.createElement('strong', null, 'Veuillez corriger les erreurs suivantes :'),
                        React.createElement('ul', { style: { margin: '8px 0 0 16px' } }, ...items)
                    );
                    toast.error(content as any);
                } else {
                    const lines = Object.entries(result.errors).map(([k, m]) => `• ${k}: ${m}`);
                    const message = ["Veuillez corriger les erreurs suivantes :", ...lines].join("\n");
                    toast.error(message);
                }
            }
            return result.valid;
        }
    }))
}