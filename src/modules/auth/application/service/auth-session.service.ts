import {FetchService} from "@/core/infrastructure/utilities/fetch.service";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {
    type CreateUserAccountInterface,
    type CreateUserSessionInterface
} from "@/modules/auth/domain/interface/session.interface";


export class AuthSessionService extends FetchService {
    static async fetchAvailableSessions() {
        const token = AuthUserService.getToken();

        if (!token) return undefined;
        return this.get(`/auth/sessions/${token}`);
    }

    static async signIn(payload: CreateUserSessionInterface) {
        return await this.post(`/auth/sign-in`, payload)
    }

    static async signUp(payload: CreateUserAccountInterface) {
        return await this.post(`/auth/sign-up`, payload)
    }
}