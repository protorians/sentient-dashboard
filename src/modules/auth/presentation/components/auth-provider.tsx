"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authUserConnectedStore } from "@/modules/auth/infrastructure/store/auth-user-connected.store"
import { AuthUserService } from "@/modules/auth/application/service/auth-user.service"
import { AuthApiService } from "@/modules/auth/application/service/auth-api-service"
import { AuthSessionView } from "@/modules/auth/presentation/auth-session.view"
import {AuthConfig} from "@/core/domain/config/auth.config";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setCurrentUser, setOrganizations, setCurrentOrganization, getCurrentUser } = authUserConnectedStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = AuthUserService.getToken()
        const user = AuthUserService.getUser()
        const organizations = AuthUserService.getOrganizations()
        const currentOrganization = AuthUserService.getCurrentOrganization()

        if (token && user) {
          // On met à jour le store avec les données du cache local
          setCurrentUser(user)
          setOrganizations(organizations)
          if (currentOrganization) setCurrentOrganization(currentOrganization)
          try {
            const response = await AuthApiService.fetchAvailableSessions()
            // Si l'API renvoie des données utilisateur fraîches, on les met à jour
            if (response && response.data) {
                // Adapter selon la réponse de l'API
                // setCurrentUser(response.data.user)
            }
          } catch (e) {
            console.error("Session verification failed", e)
            // Si la session est invalide côté serveur, on déconnecte
            // await AuthUserService.clear()
            // router.push("/auth/sign-in")
          }
        }
      } catch (error) {
        console.error("Auth initialization error", error)
      } finally {
        setIsInitialized(true)
      }
    }

    initAuth()
  }, [setCurrentUser])

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
    return <AuthSessionView />
  }

  return <>{children}</>
}
