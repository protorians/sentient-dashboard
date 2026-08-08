import {cn} from "@/core/infrastructure/utilities/utils";
import {HeaderMenubar} from "@/core/presentation/themes/katon/header-menubar";
import {useRouter} from "next/navigation";
import {Button} from "@/core/presentation/ui/button";
import {ArrowLeftIcon} from "lucide-react";

export interface BeverageSalesHeaderProps {
    className?: string;
    fixed?: boolean;
}

export function BeverageSalesHeader({className, fixed = true}: BeverageSalesHeaderProps) {
    const router = useRouter();

    return (
        <div
            id="beverage-sales-header"
            className={cn(
                "flex flex-col md:flex-row md:items-start gap-4 pt-4 h-24 w-screen ",
                fixed && "fixed top-0 z-10 [&+*]:mt-24 -mx-4 md:-mx-6 px-4 md:px-6 backdrop-blur-xl bg-background/70 mask-[linear-gradient(to_bottom,background_30%,transparent_100%)]",
                className
            )}
        >
            <div className="flex items-center gap-3">
                <Button onClick={() => router.back()} variant="outline" size="lg">
                    <ArrowLeftIcon/>
                    Quitter
                </Button>
            </div>
            {/*<BeverageSalesHeaderMenu />*/}
            <HeaderMenubar size={'md'}/>
        </div>
    );
}
