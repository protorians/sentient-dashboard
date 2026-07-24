import React from "react";
import {StartMenu} from "@/core/presentation/themes/katon/start-menu";
import Link from "next/link";
import {ThemeLogo} from "@/core/presentation/system/logo.theme";

export interface WrapperProps {
    children: React.ReactNode;
}

export function Wrapper({children}: WrapperProps) {
    return (
        <div className=" max-w-screen w-full h-screen flex flex-row gap-0">
            <div className="fixed z-10 [&+*]:ml-20 top-0 bottom-0 w-20 flex flex-col h-full gap-0">
                <div className="w-full px-3">
                    <Link href={"/public"} className="px-2">
                        <ThemeLogo color={"black"} onDark={"white"} variant={"square"}/>
                    </Link>
                </div>

                <div className="flex-auto flex flex-col justify-start px-2 mb-20">
                    <StartMenu/>
                </div>
            </div>
            <div className="flex flex-col gap-0 flex-auto">
                {children}
            </div>
        </div>
    );
}