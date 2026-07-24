"use client"

import React, {useCallback, useEffect, useState} from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthUserService } from "@/modules/auth/application/service/auth-user.service"
import { AuthSessionView } from "@/modules/auth/presentation/auth-session.view"
import {AuthConfig} from "@/core/domain/config/auth.config";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const {user} = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const goLogin = useCallback(() => {
        router.push(`${AuthConfig.routes.login}?callbackUrl=${encodeURIComponent(pathname)}`)
  }, [user])

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = AuthUserService.isAuthenticated()
      // const isAuthRoute = pathname.startsWith('/auth')
      const isAuthRoute = AuthConfig.excludes.some((route) => pathname.startsWith(route))

      if (!isAuthenticated && !isAuthRoute) {
        goLogin()
      } else {
        setIsAuthorized(true)
      }
    }

    checkAuth()
  }, [pathname, router, user])

  if (!isAuthorized) {
    return <AuthSessionView />
  }

  return <>{children}</>
}
