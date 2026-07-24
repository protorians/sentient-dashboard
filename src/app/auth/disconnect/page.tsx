"use client"

import {UnplugIcon} from "lucide-react";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {AuthConfig} from "@/core/domain/config/auth.config";

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace(AuthConfig.routes.login)
            router.refresh()
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-xl flex flex-col items-start md:flex-row md:items-center gap-6">
                <div className="">
                    <UnplugIcon className={"w-16 h-16 text-primary"}/>
                </div>
                <div className="">
                    <h1>Vous êtes maintenant déconnecté</h1>
                    <p>Redirection vers la page d'accueil dans quelques secondes...</p>
                </div>
            </div>
        </div>
    )
}
