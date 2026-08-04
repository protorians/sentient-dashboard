import {Sheet, SheetContent, SheetTrigger} from "@/core/presentation/ui/sheet";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface LegacySheetProps {
    trigger: React.ReactNode;
    children?: React.ReactNode;
    opened?: boolean;
    onOpenChange?: (status: boolean) => void;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
}

export function LegacySheet({opened, children, onOpenChange, trigger, side, className}: LegacySheetProps) {

    side = side ?? 'right';

    return (
        <Sheet open={opened} onOpenChange={onOpenChange}>
            {trigger && (
                <SheetTrigger className={cn('flex items-center w-full')} asChild>
                    {trigger}
                </SheetTrigger>
            )}
            <SheetContent
                side={side ?? 'right'}
                className={cn(
                    'bg-background/95 backdrop-blur-4xl rounded-xl m-4',
                    side === 'left' || side === 'right' ? 'w-[calc(100dvw-32px)]! sm:min-w-[80dvw]!  md:min-w-[60dvw]! lg:min-w-[35dvw]! h-full! max-h-[calc(100dvh-32px)]!' : '',
                    side === 'top' || side === 'bottom' ? 'min-h-dvh md:min-h-[35dvh]! w-full! max-w-[calc(100dvw-32px)]!' : '',
                    className,
                )}
            >
                {children}
            </SheetContent>
        </Sheet>
    )
}