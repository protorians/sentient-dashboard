"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactNode} from "react";

export interface QueryProviderProps{
    children: ReactNode
}

const queryClient = new QueryClient()
export function QueryProvider({children}: QueryProviderProps){
    return (

        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}