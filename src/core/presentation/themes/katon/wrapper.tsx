import React from "react";
import {HeaderNavigation} from "@/core/presentation/themes/katon/header-navigation";
import Link from "next/link";
import {ThemeLogo} from "@/core/presentation/system/logo.theme";

export interface WrapperProps {
    children: React.ReactNode;
}

export function Wrapper({children}: WrapperProps) {
    return (
        <div className=" max-w-screen w-full h-screen flex flex-row gap-0">
            <div className="fixed z-10 [&+*]:ml-20 top-0 w-20 flex flex-col h-full gap-0">
                <div className="w-full">
                    <Link href={"/public"} className="size-16 p-2">
                        <ThemeLogo variant={"square"}/>
                    </Link>
                </div>

                <div className="flex-auto flex flex-col justify-start px-2 mb-20">
                    <HeaderNavigation/>
                </div>
            </div>
            <div className="flex flex-col gap-0 flex-auto">
                {children}
            </div>
        </div>
    );
}