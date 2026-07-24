import {ApiService} from "@/core/infrastructure/utilities/api-service";

export class NotificationsApiService extends ApiService {
    static async getAll() {
        return await this.get('/notifications/');
    }

    static async markAsRead(id: string) {
        return await this.patch(`/notifications/${id}/read`);
    }

    static async getAnalytics() {
        return await this.get('/notifications/analytics');
    }
}
