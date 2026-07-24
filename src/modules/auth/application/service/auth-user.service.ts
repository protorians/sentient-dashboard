import {CacheStorageCapability} from "@/core/infrastructure/capabilities/cache-storage/capability";
import {AuthCacheInterface} from "@/modules/auth/domain/typing/auth-caches";
import {CacheStorageType} from "@/core/infrastructure/capabilities/cache-storage/enum";
import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {UserAuthResponseInterface} from "@/modules/auth/domain/entities/user-auth.interface";
import {OrganizationInterface} from "@/modules/organizations/domain/entities/organization.interface";
import {AuthConfig} from "@/core/domain/config/auth.config";

const instance = new CacheStorageCapability<AuthCacheInterface>(AuthConfig.storages.sessionKey, CacheStorageType.LOCAL);

const setCookie = (name: string, value: string, days = 7) => {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
}

const deleteCookie = (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; Max-Age=-99999999; path=/;';
}

export class AuthUserService {

    static getUser(): UserInterface | null {
        return instance.get('user') ?? null;
    }

    static getToken(): string | null {
        return instance.get('token') ?? null;
    }

    static getDevice(): string | null {
        return instance.get('device') ?? null;
    }

    static getOrganizations(): OrganizationInterface[] {
        return instance.get('organizations') ?? [];
    }

    static getCurrentOrganization(): OrganizationInterface | null {
        return instance.get('currentOrganization') ?? null;
    }

    static getApiKey(): string | null {
        return instance.get('apiKey') ?? null;
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    static async setUser(user: UserInterface) {
        await instance.set('user', user).save();
    }

    static async setToken(token: string) {
        await instance.set('token', token).save();
        setCookie('token', token);
    }

    static async setDevice(device: string) {
        await instance.set('device', device).save();
    }

    static async setOrganizations(organizations: OrganizationInterface[]) {
        await instance.set('organizations', organizations).save();
    }

    static async setCurrentOrganization(organization: OrganizationInterface) {
        await instance.set('currentOrganization', organization).save();
    }

    static async setApiKey(apiKey: string) {
        await instance.set('apiKey', apiKey).save();
    }

    static async setSession(payload: UserAuthResponseInterface) {
        const {user, token, device, organizations} = payload;
        instance
            .set('user', user)
            .set('token', token)
            .set('device', device)
            .set('organizations', organizations);

        await instance.save();
        setCookie('token', token);
    }

    static async clear() {
        await instance.clear().save();
        deleteCookie('token');
    }
}
