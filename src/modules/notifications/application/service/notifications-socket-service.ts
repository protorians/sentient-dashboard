"use client"

import {SocketService} from "@/core/infrastructure/utilities/socket-service";
import {AuthUserService} from "@/modules/auth/application/service/auth-user.service";

export interface SocketNotificationResponse<T = any> {
    message: string;
    statusCode: number;
    data: T;
}

export class NotificationsSocketService extends SocketService {

    protected static _listening: boolean = false;
    protected static _pending: Map<string, Array<(response: SocketNotificationResponse) => void>> = new Map();

    static connectNotifications(): WebSocket {
        const socket = this.instance;
        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return socket;
        }
        return this.connect('/notifications');
    }

    static getUserNotifications<T = any>(page = 1, limit = 10): Promise<T> {
        return this.emit<T>('user-notifications', {page, limit});
    }

    static getOrganizationNotifications<T = any>(organizationId?: string, page = 1, limit = 10): Promise<T> {
        return this.emit<T>('organization-notifications', organizationId
            ? {organizationId, page, limit}
            : {page, limit});
    }

    protected static emit<T = any>(event: string, extra?: Record<string, any>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const token = AuthUserService.getToken();
            if (!token) {
                reject(new Error('Token manquant'));
                return;
            }

            this.connectNotifications();
            this.listen();

            const queue = this._pending.get(event) ?? [];
            queue.push((response) => {
                if (response.statusCode === 200) resolve(response.data as T);
                else reject(response);
            });
            this._pending.set(event, queue);

            this.send({event, data: {token, ...extra}});
        });
    }

    protected static listen(): void {
        if (this._listening) return;
        this._listening = true;
        this.on('message', (payload) => this.resolve(payload));
    }

    protected static resolve(payload: any): void {
        const response = payload as SocketNotificationResponse;
        if (!response || typeof response !== 'object' || !('statusCode' in response)) return;

        for (const [event, queue] of this._pending.entries()) {
            const resolve = queue.shift();
            if (!resolve) continue;
            if (queue.length === 0) this._pending.delete(event);
            resolve(response);
            return;
        }
    }

}
