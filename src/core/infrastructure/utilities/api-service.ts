import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {AppConfig} from "@/core/domain/config/app.config";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";
import {redirect} from "next/navigation";
import {AuthConfig} from "@/core/domain/config/auth.config";
import {toast} from "sonner";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {authLogoutUtil} from "@/modules/auth/infrastructure/utilities/auth-logout.util";

export class ApiService {

    protected static _instance: AxiosInstance | undefined;

    protected static baseUrl: string = AppConfig.API_HOST as string;
    protected static timeout: number = AppConfig.API_TIMEOUT;

    static get instance() {
        this._instance = this._instance || axios.create({
            baseURL: `${this.baseUrl}`,
            timeout: this.timeout,
            headers: {
                // "X-API-KEY": `${AppConfig.key}`,
                // "X-API-TOKEN": `${AppConfig.token}`,
                // "X-TIMESTAMP": Math.floor(Date.now()/1000).toString(),
            },
        })

        // this._instance = this._instance || axios;

        return this._instance;
    }

    static async request<T>(method: string, uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        const isGetMethod = method.toLowerCase() === 'get'
        const token = AuthUserService.getToken();
        const device = AuthUserService.getDevice();
        const apiKey = AuthUserService.getApiKey();
        const organization = AuthUserService.getCurrentOrganization();
        const headers = {
            "X-timestamp": (new Date()).toString(),
            "Content-Type": "application/json",
            "Accept": "*",
            ...(token ? {"Authorization": `Bearer ${token}`} : {}),
            ...(device ? {"X-Device": device} : {}),
            ...(apiKey ? {"X-API-KEY": apiKey} : {}),
            ...(organization ? {"X-Organization-Id": organization.id} : {})
        }

        let url = `${this.baseUrl}${uri}`;

        if (isGetMethod) {
            let queryString = '';
            if (data) {
                const params = Object.entries(data)
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                    .join('&');
                if (params) {
                    queryString = (url.includes('?') ? '&' : '?') + params;
                }
            }
            url = `${url}${queryString.toString()}`;
            data = undefined;
        }

        try {
            return await this.instance.request({method, data, url, headers});
        } catch (error: any) {
            this.parseError(error);
            if (axios.isAxiosError(error) && error.response)
                await this.checkUnAuthenticationError(error.response);
            throw error;
        }

    }

    protected static async checkUnAuthenticationError<T extends AxiosResponse<any>>(responses: T): Promise<void> {
        if (typeof responses === 'object') {
            if (responses.status === 401 || responses.status === 403) {
                toast.error(`Vous n'êtes pas authorisé à avoir acceder à cette ressource`);
                await authLogoutUtil();
                redirect(AuthConfig.routes.login);
            }
            if (responses.status === 500) {
                if ('errorCode' in responses.data) {
                    const errorCode = parseInt((responses.data['errorCode']).toString());
                    if (errorCode === 1001) {
                        toast.error(`Vous devez être connecté pour acceder à cette ressource`);
                        await authLogoutUtil();
                        console.log(`Vous devez être connecté pour acceder à cette ressource`);
                        redirect(AuthConfig.routes.login);
                    }
                }
            }
        }
    }

    static parseError(error: any, defaultMessage?: string) {
        toast.error(
            (axios.isAxiosError(error) && error.response)
                ? error.response.data.message
                : defaultMessage || error.message || "Une erreur est survenue pendant le traitement de la requête"
        )
    }

    static async post<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request<T>('post', `${uri}`, data, config);
    }

    static async get<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request<T>('get', `${uri}`, data, config);
    }

    static async put<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request<T>('put', `${uri}`, data, config);
    }

    static async patch<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request<T>('patch', `${uri}`, data, config);
    }

    static async delete<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request<T>('delete', `${uri}`, data, config);
    }

}