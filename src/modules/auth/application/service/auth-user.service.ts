import {CacheStorageCapability} from "@/core/infrastructure/capabilities/cache-storage/capability";
import {AuthCacheInterface} from "@/modules/auth/domain/typing/auth-caches";
import {AuthConfig} from "@/core/domain/config/auth.config";
import {CacheStorageType} from "@/core/infrastructure/capabilities/cache-storage/enum";
import {UserInterface} from "@/modules/auth/domain/entities/user.interface";

const instance = new CacheStorageCapability<AuthCacheInterface>(AuthConfig.StorageKey, CacheStorageType.LOCAL);

export class AuthUserService {

    static getAuthCache(): AuthCacheInterface {
        return instance.toObject();
    }

    static getUser(): UserInterface | null {
        return instance.get('user') ?? null;
    }

    static getToken(): string | null {
        return instance.get('token') ?? null;
    }

    static getDevice(): string | null {
        return instance.get('device') ?? null;
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    static async setUser(user: UserInterface) {
        await instance.set('user', user).save();
    }

    static async setToken(token: string) {
        await instance.set('token', token).save();
    }

    static async setDevice(device: string) {
        await instance.set('device', device).save();
    }

    static async setSession(user: UserInterface, token: string, device?: string) {
        instance.set('user', user).set('token', token);
        if (device) instance.set('device', device);
        await instance.save();
    }

    static async clear() {
        await instance.clear().save();
    }
}
