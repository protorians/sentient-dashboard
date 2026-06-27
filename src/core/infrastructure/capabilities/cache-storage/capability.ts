"use client"

import {ICacheStorageCapability} from "@/core/infrastructure/capabilities/cache-storage/types";
import {CacheStorageType} from "@/core/infrastructure/capabilities/cache-storage/enum";
import {StackableCapability} from "@/core/infrastructure/capabilities/stackable/capability";
import {StackableEntityType} from "@/core/infrastructure/capabilities/stackable/types";
import {EncryptionService} from "@/core/infrastructure/utilities/encryption.service";


export class CacheStorageCapability<T extends StackableEntityType>
    extends StackableCapability<T>
    implements ICacheStorageCapability<T> {

    constructor(
        public readonly key: string,
        public readonly type: CacheStorageType = CacheStorageType.LOCAL,
        protected readonly encrypted: boolean = true
    ) {
        super();
        this._init();
    }

    private _init() {
        if (typeof window !== 'undefined') {
            this.load();
        }
    }

    private _getCookies(): Record<string, string> {
        if (typeof document === 'undefined') return {};
        return document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) acc[key] = decodeURIComponent(value);
            return acc;
        }, {} as Record<string, string>);
    }

    private _setCookie(name: string, value: string, days = 7) {
        if (typeof document === 'undefined') return;
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
    }

    async load(): Promise<T> {
        try {
            let stack: string | null = null;

            if (typeof window !== 'undefined') {
                if (this.type === CacheStorageType.LOCAL) {
                    stack = localStorage.getItem(this.key);
                } else if (this.type === CacheStorageType.SESSION) {
                    stack = sessionStorage.getItem(this.key);
                } else if (this.type === CacheStorageType.COOKIE) {
                    stack = this._getCookies()[this.key] || null;
                }
            } else if (this.type === CacheStorageType.COOKIE) {
                // Server-side: we might be able to get cookies if we had access to headers,
                // but in a generic capability we might not have them injected.
                // For now, return empty or handle via a specialized server-side provider if needed.
            }

            if (stack && this.encrypted) {
                try {
                    const decrypted = await EncryptionService.decrypt(stack);
                    return this.fromString(decrypted);
                } catch (e) {
                    console.error("Decryption error, falling back to raw data:", e);
                    return this.fromString(stack);
                }
            }

            return this.fromString(stack || "{}");

        } catch (e) {
            console.error(e);
        }

        return {} as T;
    }

    async save(): Promise<boolean> {
        try {
            const data = this.toJson();

            if (this.encrypted) {
                const encryptedData = await EncryptionService.encrypt(data);
                return this._persist(encryptedData);
            }

            return this._persist(data);
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    private _persist(data: string): boolean {
        if (typeof window === 'undefined') {
            // Server-side: Cannot persist to localStorage/sessionStorage.
            // For cookies, we would need to set headers, which usually happens in Middleware or Server Actions.
            return false;
        }

        if (this.type === CacheStorageType.LOCAL) {
            localStorage.setItem(this.key, data);
        } else if (this.type === CacheStorageType.SESSION) {
            sessionStorage.setItem(this.key, data);
        } else if (this.type === CacheStorageType.COOKIE) {
            this._setCookie(this.key, data);
        }
        return true;
    }

}



