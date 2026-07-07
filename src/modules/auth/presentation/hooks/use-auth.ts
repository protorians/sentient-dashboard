import { authUserConnectedStore } from "@/modules/auth/infrastructure/store/auth-user-connected.store"
import { AuthUserService } from "@/modules/auth/application/service/auth-user.service"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { getCurrentUser, setCurrentUser } = authUserConnectedStore()
  const router = useRouter()

  const logout = async () => {
    await AuthUserService.clear()
    setCurrentUser(undefined)
    router.push("/auth/sign-in")
    router.refresh()
  }

  return {
    user: getCurrentUser,
    isAuthenticated: !!getCurrentUser,
    logout
  }
}
