import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export class NotificationsService extends FetchService {
    static async getAll() {
        return await this.get('/notifications/');
    }

    static async markAsRead(id: string) {
        return await this.patch(`/notifications/${id}/read`);
    }
}
