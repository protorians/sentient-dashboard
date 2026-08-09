"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactNode} from "react";

export interface QueryProviderProps{
    children: ReactNode
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})
export function QueryProvider({children}: QueryProviderProps){
    return (

        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}