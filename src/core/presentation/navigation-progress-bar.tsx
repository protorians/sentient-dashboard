"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { WaitingBar } from "@/core/presentation/waiting-bar";

function NavigationProgressBarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const anchor = (event.target as HTMLElement).closest("a");

            if (
                anchor &&
                anchor.href &&
                anchor.target !== "_blank" &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.altKey
            ) {
                const url = anchor.href;
                const currentUrl = window.location.href;

                // Ne pas déclencher pour les ancres sur la même page
                if (url.split('#')[0] !== currentUrl.split('#')[0]) {
                    setIsNavigating(true);
                }
            }
        };

        document.addEventListener("click", handleAnchorClick);
        return () => document.removeEventListener("click", handleAnchorClick);
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            setIsNavigating(true);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    if (!isNavigating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <WaitingBar />
        </div>
    );
}

export function NavigationProgressBar() {
    return (
        <Suspense fallback={null}>
            <NavigationProgressBarContent />
        </Suspense>
    );
}
