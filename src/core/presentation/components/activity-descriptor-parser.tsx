"use client"

import {MarkdownParser} from "@/core/presentation/components/markdown-parser";
import {getNestedValue} from "@/core/infrastructure/utilities/values";
import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store";

export interface ActivityDescriptorParserProps {
    template: string;
    context: Record<string, any>;
    className?: string;
}

export function ActivityDescriptorParser({template, context, className}: ActivityDescriptorParserProps) {
    const connectedUser = authUserConnectedStore(state => state.getCurrentUser);

    const fullContext: Record<string, any> = {
        ...connectedUser,
        ...context,
    };

    let result = template;

    const placeholderRegex = /\[([^\]]+)\](?!\()/g;
    let match;

    while ((match = placeholderRegex.exec(template)) !== null) {
        const placeholder = match[0];
        const path = match[1];

        const value = getNestedValue(fullContext, path);
        const stringValue = value !== null && value !== undefined ? `**${value}**` : '';

        result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stringValue);
    }

    return <MarkdownParser text={result} className={className}/>;
}
