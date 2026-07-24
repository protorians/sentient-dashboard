import {WaitingBar} from "@/core/presentation/waiting-bar";

export interface WaitingProps {
    label?: string;
}

export function Waiting({label}: WaitingProps) {
    return (
        <div className="flex flex-col gap-2 animate-zoom-in">
            <div className="text-xs text-muted-foreground animate-pulse duration-2000">{label ?? 'Traitement en cours...'}</div>
            <WaitingBar/>
        </div>
    )
}