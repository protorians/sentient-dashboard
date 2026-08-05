import {AppConfig} from "@/core/domain/config/app.config";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";

export type SocketEvent = "open" | "message" | "error" | "close";
export type SocketEventHandler = (payload: any) => void;

export class SocketService {

    protected static _instance: WebSocket | undefined;
    protected static _listeners: Map<SocketEvent, Set<SocketEventHandler>> = new Map();
    protected static _reconnectAttempts: number = 0;
    protected static _reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    protected static _shouldReconnect: boolean = true;

    protected static get baseUrl(): string {
        const apiHost = AppConfig.SOCKET_HOST as string;
        return apiHost.replace(/^https?:\/\//, (protocol) => protocol === "https://" ? "wss://" : "ws://");
    }

    static get instance(): WebSocket | undefined {
        return this._instance;
    }

    static get isConnected(): boolean {
        return !!this._instance && this._instance.readyState === WebSocket.OPEN;
    }

    static connect(path?: string): WebSocket {
        if (this.isConnected) return this._instance!;

        const url = this.buildUrl(path);
        const socket = new WebSocket(url);

        this._instance = socket;
        this._shouldReconnect = true;
        this._reconnectAttempts = 0;

        socket.onopen = () => {
            this._reconnectAttempts = 0;
            this.dispatch("open", undefined);
        };

        socket.onmessage = (event: MessageEvent) => {
            let payload: any = event.data;
            try {
                payload = JSON.parse(event.data);
            } catch {
            }
            this.dispatch("message", payload);
        };

        socket.onerror = (event: Event) => {
            this.dispatch("error", event);
        };

        socket.onclose = (event: CloseEvent) => {
            this._instance = undefined;
            this.dispatch("close", event);
            this.scheduleReconnect();
        };

        return socket;
    }

    static disconnect(): void {
        this._shouldReconnect = false;
        if (this._reconnectTimeout) clearTimeout(this._reconnectTimeout);
        if (this._instance) this._instance.close();
        this._instance = undefined;
    }

    static send<T = any>(data: T | string): void {
        if (!this.isConnected) return;
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        this._instance!.send(payload);
    }

    static on(event: SocketEvent, handler: SocketEventHandler): () => void {
        const listeners = this._listeners.get(event) ?? new Set();
        listeners.add(handler);
        this._listeners.set(event, listeners);
        return () => this.off(event, handler);
    }

    static off(event: SocketEvent, handler: SocketEventHandler): void {
        this._listeners.get(event)?.delete(handler);
    }

    protected static dispatch(event: SocketEvent, payload: any): void {
        this._listeners.get(event)?.forEach((handler) => handler(payload));
    }

    protected static scheduleReconnect(): void {
        if (!this._shouldReconnect) return;

        const attempts = Math.min(this._reconnectAttempts, 5);
        const delay = Math.min(1000 * (2 ** attempts), 30000);

        this._reconnectTimeout = setTimeout(() => {
            this._reconnectAttempts++;
            if (!this.isConnected) this.connect();
        }, delay);
    }

    protected static buildUrl(path?: string): string {
        const token = AuthUserService.getToken();
        const device = AuthUserService.getDevice();
        const apiKey = AuthUserService.getApiKey();
        const organization = AuthUserService.getCurrentOrganization();

        const params: Record<string, string> = {};
        if (token) params["token"] = token;
        if (device) params["device"] = device;
        if (apiKey) params["apiKey"] = apiKey;
        if (organization) params["organizationId"] = organization.id;

        const query = new URLSearchParams(params).toString();
        const base = `${this.baseUrl}${path ?? ""}`;

        return query ? `${base}${base.includes("?") ? "&" : "?"}${query}` : base;
    }

}
