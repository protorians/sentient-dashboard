import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store";


export async function authLogoutUtil() {
    const {setCurrentUser} = authUserConnectedStore.getState()
    await AuthUserService.clear()
    setCurrentUser(undefined)
    return true;
}