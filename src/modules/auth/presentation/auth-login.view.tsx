"use client"

import {LoginForm} from "@/modules/auth/presentation/components/login-form";
import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store";
import {AuthSessionView} from "@/modules/auth/presentation/auth-session.view";
import {ThemeLogo} from "@/core/presentation/themes/logo.theme";
import {AppConfig} from "@/core/domain/config/app.config";
import {FormScreen} from "@/core/presentation/FormScreen";
import {useEffect} from "react";
import {AuthSessionService} from "@/modules/auth/application/service/auth-session.service";

export function AuthLoginView() {
    const {getCurrentUser} = authUserConnectedStore()

    useEffect(() => {
        AuthSessionService.fetchAvailableSessions()
            .then(data=>{
                console.log('fetchAvailableSessions', data)
            })
            .catch(err=>{
                console.error(err)
            })
    }, [])

    if (getCurrentUser) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <AuthSessionView/>
            </div>
        )
    }

    return (
        <FormScreen>
            <LoginForm />
        </FormScreen>
    )
}
