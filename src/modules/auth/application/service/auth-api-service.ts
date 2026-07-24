import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {
    type CreateUserAccountInterface,
    type CreateUserSessionInterface
} from "@/modules/auth/domain/interface/session.interface";
import {UserAuthResponseInterface} from "@/modules/auth/domain/entities/user-auth.interface";
import {FetchResponseInterface} from "@/core/domain/typing/response";
import {AuthConfig} from "@/core/domain/config/auth.config";


export class AuthApiService extends ApiService {
    static async fetchAvailableSessions() {
        const token = AuthUserService.getToken();

        if (!token) return undefined;
        return this.post(`/auth/sessions`, {token});
    }

    static async signIn(payload: CreateUserSessionInterface) {
        return await this.post<FetchResponseInterface<UserAuthResponseInterface>>(`${AuthConfig.routes.login}`, payload)
    }

    static async signUp(payload: CreateUserAccountInterface) {
        return await this.post<FetchResponseInterface<UserAuthResponseInterface>>(`${AuthConfig.routes.register}`, payload)
    }

    static async checkPhone(phone: string) {
        return await this.get<FetchResponseInterface<any>>(`${AuthConfig.routes.verifyPhone}`, {phone})
    }

    static async verifyPhone(payload: { phone: string; code: string }) {
        return await this.post<FetchResponseInterface<any>>(`${AuthConfig.routes.verifyPhone}`, payload)
    }
}