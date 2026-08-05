import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {PaginationWithSearchOptions} from "@/core/domain/typing/response";

export interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
}

export interface PushSubscriptionPayload {
    endpoint: string;
    keys: PushSubscriptionKeys;
}

export class NotificationsApiService extends ApiService {
    static async getAll(options?: PaginationWithSearchOptions & { read?: boolean }) {
        return await this.get('/notifications/', options);
    }

    static async getAllByOrganization(id: string, options?: PaginationWithSearchOptions & { read?: boolean }) {
        return await this.get(`/notifications/organizations/${id}`, options);
    }

    static async markAsRead(id: string) {
        return await this.patch(`/notifications/${id}/read`);
    }

    static async getAnalytics() {
        return await this.get('/notifications/analytics');
    }

    static async savePushSubscription(subscription: PushSubscriptionPayload) {
        return await this.post('/notifications/push-subscription', subscription);
    }

    static async removePushSubscription(endpoint: string) {
        return await this.delete('/notifications/push-subscription', {endpoint});
    }
}
