"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { WaitingBar } from "@/core/presentation/waiting-bar";

let isHistoryPatched = false;

function NavigationProgressBarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const setIsNavigatingRef = useRef(setIsNavigating);
    setIsNavigatingRef.current = setIsNavigating;

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    // useEffect(() => {
    //     const handleAnchorClick = (event: MouseEvent) => {
    //         const anchor = (event.target as HTMLElement).closest("a");
    //
    //         if (
    //             anchor &&
    //             anchor.href &&
    //             anchor.target !== "_blank" &&
    //             !event.ctrlKey &&
    //             !event.metaKey &&
    //             !event.shiftKey &&
    //             !event.altKey
    //         ) {
    //             const url = anchor.href;
    //             const currentUrl = window.location.href;
    //
    //             if (url.split('#')[0] !== currentUrl.split('#')[0]) {
    //                 setIsNavigating(true);
    //             }
    //         }
    //     };
    //
    //     document.addEventListener("click", handleAnchorClick);
    //     return () => document.removeEventListener("click", handleAnchorClick);
    // }, []);
    //
    // useEffect(() => {
    //     if (isHistoryPatched) return;
    //     isHistoryPatched = true;
    //
    //     const originalPushState = window.history.pushState.bind(window.history);
    //     const originalReplaceState = window.history.replaceState.bind(window.history);
    //
    //     window.history.pushState = function (...args: Parameters<typeof window.history.pushState>) {
    //         const result = originalPushState(...args);
    //         queueMicrotask(() => setIsNavigatingRef.current(true));
    //         return result;
    //     };
    //     window.history.replaceState = function (...args: Parameters<typeof window.history.replaceState>) {
    //         const result = originalReplaceState(...args);
    //         queueMicrotask(() => setIsNavigatingRef.current(true));
    //         return result;
    //     };
    //
    //     return () => {
    //         window.history.pushState = originalPushState;
    //         window.history.replaceState = originalReplaceState;
    //         isHistoryPatched = false;
    //     };
    // }, []);
    //
    // useEffect(() => {
    //     const handlePopState = () => {
    //         setIsNavigating(true);
    //     };
    //
    //     window.addEventListener("popstate", handlePopState);
    //     return () => window.removeEventListener("popstate", handlePopState);
    // }, []);

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
