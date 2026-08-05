import {cn} from "@/core/infrastructure/utilities/utils";


export interface MainWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    className?: string;
}

export function MainWrapper({children, className, ...props}: MainWrapperProps) {
    return (
        <div {...props} className={cn(
            "w-full max-w-5xl mx-auto flex flex-col gap-6",
            className,
        )}>
            {children}
        </div>
    )
}