import {cn} from "@/core/infrastructure/utilities/utils";
import {CommonClassName} from "@/core/infrastructure/utilities/classname.util";

export interface HeaderSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export function EdgeSection({children, ...props}: HeaderSectionProps) {
    return (
        <div {...props} className={cn(
            "flex flex-row items-center",
            CommonClassName.layer,
            CommonClassName.glossyBorder,
            props.className,
        )}>
            {children}
        </div>
    )
}
