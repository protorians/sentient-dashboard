"use client"

import React, {useEffect, useState} from "react"
import {useRouter, usePathname} from "next/navigation"
import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store"
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service"
import {AuthApiService} from "@/modules/auth/application/service/auth-api-service"
import {AuthSessionView} from "@/modules/auth/presentation/auth-session.view"
import {AuthConfig} from "@/core/domain/config/auth.config";
import {AppConfig} from "@/core/domain/config/app.config";
import {toast} from "sonner";

export function AuthProvider({children}: { children: React.ReactNode }) {
    const {setCurrentUser, setOrganizations, setCurrentOrganization, getCurrentUser} = authUserConnectedStore()
    const [isInitialized, setIsInitialized] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const initAuth = async () => {
            try {
                const token = AuthUserService.getToken()
                const user = AuthUserService.getUser()
                const organizations = AuthUserService.getOrganizations()
                const currentOrganization = AuthUserService.getCurrentOrganization()

                if (token && user) {
                    setCurrentUser(user)
                    setOrganizations(organizations)
                    if (currentOrganization) setCurrentOrganization(currentOrganization)

                    try {
                        const response = await AuthApiService.fetchAvailableSessions()
                        if (response && response.data) {
                            // if (response.data.data.token)
                            //     await AuthUserService.setToken(response.data.data.token)
                        }
                    } catch (e) {
                        console.error("Session verification failed", e)
                        await AuthUserService.clear()
                        router.push(AuthConfig.routes.login)
                        toast.error("Votre session a expiré")
                        return;
                    }
                }
            } catch (error) {
                console.error("Auth initialization error", error)
            } finally {
                setIsInitialized(true)
                timeoutId = setTimeout(initAuth, AppConfig.AUTH_CHECK_SESSION_TIMEOUT || 30000)
            }
        }

        initAuth()

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [setCurrentUser, setOrganizations, setCurrentOrganization, router])

    useEffect(() => {
        if (isInitialized) {
            const token = AuthUserService.getToken()
            const currentOrganization = AuthUserService.getCurrentOrganization()
            const isAuthRoute = pathname.startsWith('/auth')

            if (!token && !isAuthRoute) {
                router.push(`${AuthConfig.routes.login}?callbackUrl=${encodeURIComponent(pathname)}`)
                return
            }

            if (token && !currentOrganization && !isAuthRoute && pathname !== '/') {
                router.push(`${AuthConfig.routes.selectOrganization}?callbackUrl=${encodeURIComponent(pathname)}`)
            }
        }
    }, [isInitialized, pathname, router])

    if (!isInitialized) {
        return <AuthSessionView/>
    }

    return <>{children}</>
}
