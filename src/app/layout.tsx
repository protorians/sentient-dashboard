import {Manrope} from "next/font/google";
import {cn} from "@/core/infrastructure/utilities/utils";
import "./globals.css";
import {TooltipProvider} from "@/core/presentation/ui/tooltip"
import {Toaster} from "@/core/presentation/ui/sonner";
import {AuthProvider} from "@/modules/auth/presentation/components/auth-provider";
import {NavigationProgressBar} from "@/core/presentation/navigation-progress-bar";
import {ModulesDefinition} from "@/modules";
import {QueryProvider} from "@/core/infrastructure/providers/query.provider";
import {AuthGuard} from "@/modules/auth/presentation/components/auth-guard";
import {ThemeProvider} from "@/core/infrastructure/providers/theme.provider";
import {ModulesSwitcherProvider} from "@/core/infrastructure/providers/modules-switcher.provider";
import {ModulesRoutinesProvider} from "@/core/infrastructure/providers/modules-routines.provider";
import {ModulesGuardProvider} from "@/core/infrastructure/providers/modules-guard.provider";
import ModalPortal from "@/core/presentation/modals/components/ModalPortal";
import {FloatingUpload} from "@/core/presentation/components/floating-upload";

const manrope = Manrope({subsets: ['latin'], variable: '--font-sans'});

export const metadata = {
    title: 'Sentient Frontend',
    description: 'CMS frontend for Sentient dashboard',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="fr" className={cn(manrope.variable, "")}>
        <head>
            <link rel="stylesheet" href="/assets/fonts/font-awesome/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/bold-rounded/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/regular-rounded/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/solid-rounded/all.css"/>
        </head>
        <body>
        <AuthProvider>
            <QueryProvider>
                <ModulesDefinition/>
                <NavigationProgressBar/>
                <AuthGuard>
                    <ModulesSwitcherProvider/>
                    <ModulesRoutinesProvider/>
                    <ModulesGuardProvider>
                        <ThemeProvider/>
                        <TooltipProvider>
                            {children}
                            <ModalPortal/>
                            <FloatingUpload/>
                        </TooltipProvider>
                    </ModulesGuardProvider>
                </AuthGuard>
                <Toaster/>
            </QueryProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
