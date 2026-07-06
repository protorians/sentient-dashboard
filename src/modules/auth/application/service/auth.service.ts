import {FetchService} from "@/core/infrastructure/utilities/fetch.service";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {
    type CreateUserAccountInterface,
    type CreateUserSessionInterface
} from "@/modules/auth/domain/interface/session.interface";


export class AuthService extends FetchService {
    static async fetchAvailableSessions() {
        const token = AuthUserService.getToken();

        if (!token) return undefined;
        return this.get(`/auth/sessions/${token}`);
    }

    static async signIn(payload: CreateUserSessionInterface) {
        return await this.post(`/auth/sign-in/`, payload)
    }

    static async signUp(payload: CreateUserAccountInterface) {
        return await this.post(`/auth/sign-up/`, payload)
    }

    static async checkPhone(phone: string) {
        return await this.get(`/auth/sign-up/check-phone`, { phone })
    }

    static async verifyPhone(payload: { phone: string; code: string }) {
        return await this.post(`/auth/sign-up/check-phone`, payload)
    }
}