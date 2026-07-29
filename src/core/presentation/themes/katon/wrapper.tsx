import React from "react";
import {StartMenu} from "@/core/presentation/themes/katon/start-menu";
import Link from "next/link";
import {ThemeLogo} from "@/core/presentation/system/logo.theme";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface WrapperProps {
    children: React.ReactNode;
}

export function Wrapper({children}: WrapperProps) {
    return (
        <div className=" max-w-screen w-full min-h-[100dvh-64px] flex flex-col md:flex-row gap-0 pb-24">
            <div className={cn(
                "fixed z-20 [&+*]:mt-16 md:[&+*]:mt-0 md:[&+*]:ml-20 top-0 bottom-0 w-full h-20 md:w-20 md:h-full gap-0",
                "flex flex-row md:flex-col"
            )}>
                <div className="md:px-3 px-2 w-16 h-16 flex items-center justify-center">
                    <Link href={"/public"} className="">
                        <ThemeLogo color={"black"} onDark={"white"} variant={"square"}/>
                    </Link>
                </div>
                <div className="flex-auto flex flex-row md:flex-col justify-start px-2 md:mb-20">
                    <StartMenu/>
                </div>
            </div>
            <div className="flex flex-col gap-0 flex-auto">
                {children}
            </div>
        </div>
    );
}