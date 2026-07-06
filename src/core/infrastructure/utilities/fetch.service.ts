import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {AppConfig} from "@/core/domain/config/app.config";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";

export class FetchService {

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

    static async request(method: string, uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<any, any, {}>> {
        const isGetMethod = method.toLowerCase() === 'get'
        const token = AuthUserService.getToken();
        const headers = {
            "X-timestamp": (new Date()).toString(),
            "Content-Type": "application/json",
            "Accept": "*",
            ...(token ? {"Authorization": `Bearer ${token}`} : {})
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
            return this.instance.request({method, data, url, headers});
        } catch (e: any) {
            console.error("Fetch Error", e)
            throw new Error(e.message || e)
        }

    }

    static async post<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request('post', `${uri}`, data, config);
    }

    static async get<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request('get', `${uri}`, data, config);
    }

    static async put<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request('put', `${uri}`, data, config);
    }

    static async patch<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request('patch', `${uri}`, data, config);
    }

    static async delete<T = any>(uri: string, data?: Record<string, any>, config?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any, {}>> {
        return await this.request('delete', `${uri}`, data, config);
    }

}