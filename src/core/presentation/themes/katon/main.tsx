import {cn} from "@/core/infrastructure/utilities/utils";

export interface MainProps {
    className?: string
    children?: React.ReactNode
}

export function Main({className, children}: MainProps) {
    return (
        <main className={cn(
            "flex-auto min-h-[100dvh-64px] w-full",
            className
        )}>
            {children}
        </main>
    )
}