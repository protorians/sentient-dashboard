import {Waiting, WaitingProps} from "@/core/presentation/waiting";
import React from "react";


export interface WaitingSectionProps extends WaitingProps, React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function WaitingSection({label, className, ...props}: WaitingSectionProps) {
    return (
        <div {...props} className={`flex-auto flex justify-center items-center ${className || ''}`}>
            <Waiting label={label}/>
        </div>
    )
}