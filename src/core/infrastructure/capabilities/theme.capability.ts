import {CacheStorageCapability} from "@/core/infrastructure/capabilities/cache-storage/capability";
import {CacheStorageType} from "@/core/infrastructure/capabilities/cache-storage/enum";
import {ThemeConfig} from "@/core/domain/config/theme.config";
import {ThemeCacheInterface} from "@/core/domain/typing/theme-caches";

const instance = new CacheStorageCapability<ThemeCacheInterface>(ThemeConfig.StorageKey, CacheStorageType.LOCAL)

export function getThemeCaches() {
    return instance;
}

export function getThemeCached() {
    return instance.toObject();
}

export async function syncThemeCache<K extends keyof ThemeCacheInterface>(key: K, value: ThemeCacheInterface[K]) {
    await instance.set(key, value).save();
    return instance;
}
