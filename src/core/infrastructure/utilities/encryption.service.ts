"use client"

export class EncryptionService {
    private static algorithm = { name: 'AES-GCM', length: 256 };
    private static key: CryptoKey | null = null;
    private static readonly ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

    private static async getWebCrypto(): Promise<Crypto> {
        if (typeof window !== 'undefined' && window.crypto) {
            return window.crypto;
        }
        if (typeof globalThis !== 'undefined' && globalThis.crypto) {
            return globalThis.crypto;
        }
        // For older Node.js environments if globalThis.crypto is not available
        try {
            const { webcrypto } = await import('node:crypto');
            return webcrypto as unknown as Crypto;
        } catch (e) {
            throw new Error('Web Crypto API not available');
        }
    }

    private static async getKey(): Promise<CryptoKey> {
        if (this.key) return this.key;

        if (!this.ENCRYPTION_KEY) {
            throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY is not defined');
        }

        const webCrypto = await this.getWebCrypto();
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.ENCRYPTION_KEY);
        
        // Hash the key to ensure it has the correct length for AES-GCM (256 bits)
        const hash = await webCrypto.subtle.digest('SHA-256', keyData);

        this.key = await webCrypto.subtle.importKey(
            'raw',
            hash,
            this.algorithm,
            false,
            ['encrypt', 'decrypt']
        );

        return this.key;
    }

    private static arrayBufferToBase64(buffer: Uint8Array): string {
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(buffer).toString('base64');
        }
        return btoa(String.fromCharCode(...buffer));
    }

    private static base64ToArrayBuffer(base64: string): Uint8Array {
        if (typeof Buffer !== 'undefined') {
            return new Uint8Array(Buffer.from(base64, 'base64'));
        }
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    static async encrypt(data: string): Promise<string> {
        try {
            const key = await this.getKey();
            const webCrypto = await this.getWebCrypto();
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(data);
            
            // Initialization vector (IV) - must be unique for each encryption
            const iv = webCrypto.getRandomValues(new Uint8Array(12));
            
            const encryptedBuffer = await webCrypto.subtle.encrypt(
                {
                    name: this.algorithm.name,
                    iv: iv
                },
                key,
                encodedData
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encryptedBuffer), iv.length);

            // Convert to base64 for storage
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    static async decrypt(encryptedData: string): Promise<string> {
        try {
            const key = await this.getKey();
            const webCrypto = await this.getWebCrypto();
            const combined = this.base64ToArrayBuffer(encryptedData);

            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const decryptedBuffer = await webCrypto.subtle.decrypt(
                {
                    name: this.algorithm.name,
                    iv: iv
                },
                key,
                data
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw error;
        }
    }
}
