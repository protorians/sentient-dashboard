import {Manrope} from "next/font/google";
import {cn} from "@/core/infrastructure/utilities/utils";
import "./globals.css";
import {TooltipProvider} from "@/core/presentation/ui/tooltip"
import {Toaster} from "sonner";

const manrope = Manrope({subsets: ['latin'], variable: '--font-sans'});

export const metadata = {
    title: 'Sentient Frontend',
    description: 'CMS frontend for Sentient dashboard',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="fr" className={cn(manrope.variable, "dark")}>
        <head>
            <link rel="stylesheet" href="/assets/fonts/font-awesome/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/bold-rounded/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/regular-rounded/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/solid-rounded/all.css"/>
        </head>
        <body>
        <TooltipProvider>
            {children}
        </TooltipProvider>
        <Toaster />
        </body>
        </html>
    );
}
