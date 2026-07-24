"use client";

import {cn} from "@/core/infrastructure/utilities/utils";
import {ThemeLogo} from "@/core/presentation/system/logo.theme";
import {AppConfig} from "@/core/domain/config/app.config";
import Link from "next/link";
import {motion} from "framer-motion";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {Button} from "@/core/presentation/ui/button";
import {ThemeSwitcherButton} from "@/core/presentation/ThemeSwitcherButton";
import {Fragment} from "react";

export interface FormScreenProps extends React.HTMLAttributes<HTMLDivElement> {
    hideSideImage?: boolean;
}

const COPYRIGHT_YEAR = new Intl.DateTimeFormat('fr-FR', {year: 'numeric'}).format(new Date());

export function FormScreen({className, children, hideSideImage, ...props}: FormScreenProps) {
    const {user, logout} = useAuth()

    return (
        <Fragment>
            <div className="w-full flex justify-end items-center">
                <div className="p-4">
                    <ThemeSwitcherButton/>
                </div>
            </div>
            <div {...props}
                 className={cn("flex flex-col min-h-svh items-center justify-center bg-background p-4 md:p-10", className,)}>
                <motion.div
                    layoutId="form-card"
                    className={cn(
                        "relative w-full max-w-225 min-h-150 rounded-[32px] overflow-hidden bg-background border border-white/5",
                        hideSideImage && "flex flex-col justify-center",
                        !hideSideImage && "grid lg:grid-cols-[1.15fr_0.85fr]"
                    )}>
                    {/* Left side (Form) */}
                    <div className="flex flex-col justify-between gap-8 p-8 md:p-12 ">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    layoutId="form-logo-container"
                                    className="w-full max-w-80 rounded-full  flex items-center justify-center">
                                    <ThemeLogo variant="banner" color={"black"} onDark={"white"}
                                               className="object-contain"/>
                                </motion.div>
                                {/*<span className="font-bold text-sm text-white">Sentient</span>*/}
                            </div>
                            <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                {/*<Link href="/public" className="hover:text-white transition-colors">Accueil</Link>*/}
                                {/*<Link href="/auth/sign-in" className="hover:text-white transition-colors">Se connecter</Link>*/}
                                {/*<Link href="/auth/sign-up" className="hover:text-white transition-colors">Rejoindre</Link>*/}
                            </div>
                        </div>
                        <div className="flex flex-1 items-center justify-center w-full">
                            {children}
                        </div>
                        {
                            user && (
                                <div className="flex flex-row items-center">
                                    <Button onClick={logout} variant="ghost">
                                        Se déconnecter
                                    </Button>
                                </div>
                            )
                        }
                        <motion.div
                            layoutId="form-copyright"
                            className="text-left text-[10px] text-muted-foreground/30 font-medium uppercase tracking-wider">
                            © {COPYRIGHT_YEAR} {AppConfig.APP_NAME}
                        </motion.div>
                    </div>
                    {/* Right side (Image with curvy separator) */}
                    {!hideSideImage && (<motion.div
                        layoutId="form-right-side"
                        className="relative hidden lg:block overflow-hidden">
                        <motion.img
                            layoutId="form-bg-image"
                            src="/assets/images/image-001.jpg"
                            alt={AppConfig.APP_NAME}
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
                        />
                        {/* Wavy separator overlay */}
                        <motion.div
                            layoutId="form-separator"
                            className="absolute top-0 bottom-0 left-0 w-8 -ml-px fill-background stroke-none">
                            <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="h-full w-full">
                                <path d="M100 0 C 35 250, 40 750, 100 1000 L0 1000 L0 0 Z"/>
                            </svg>
                        </motion.div>
                        {/* Bottom-right watermark logo */}
                        <motion.div
                            layoutId="form-watermark"
                            className="absolute bottom-8 right-8 text-white select-none ">
                            <ThemeLogo variant="icon" className="h-8 w-auto object-contain brightness-0 invert"/>
                        </motion.div>
                    </motion.div>)}
                </motion.div>
            </div>
        </Fragment>
    )
}
