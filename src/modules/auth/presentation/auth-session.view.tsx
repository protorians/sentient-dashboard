"use client"

import {Waiting} from "@/core/presentation/waiting";

export function AuthSessionView() {
    return (
        <div className="w-screen h-screen flex justify-center items-center flex-col gap-4">
            <div className="max-w-lg w-full mx-auto">
                <Waiting label={"Synchronisation..."} />
            </div>
        </div>
    )
}