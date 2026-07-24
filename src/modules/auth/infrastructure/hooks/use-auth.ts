import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store"
import {useRouter} from "next/navigation"
import {AuthConfig} from "@/core/domain/config/auth.config";
import {authLogoutUtil} from "@/modules/auth/infrastructure/utilities/auth-logout.util";

export function useAuth() {
    const {getCurrentUser, setCurrentUser} = authUserConnectedStore()
    const router = useRouter()

    const logout = async () => {
        await authLogoutUtil();
        router.push(`${AuthConfig.routes.logout}`)
    }

    return {
        user: getCurrentUser,
        isAuthenticated: !!getCurrentUser,
        logout
    }
}
