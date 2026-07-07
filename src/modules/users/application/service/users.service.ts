import {FetchService} from "@/core/infrastructure/utilities/fetch.service";
import {UserAnalyticsInterface} from "@/modules/users/domain/users.interface";

export class UsersService extends FetchService {
    // Users
    static async getAll() {
        return await this.get('/users/');
    }

    static async getById(id: string) {
        return await this.get(`/users/${id}`);
    }

    static async getAnalytics() {
        return await this.get<UserAnalyticsInterface>('/users/analytics');
    }

    // User Preferences
    static async createPreference(payload: any) {
        return await this.post('/user-preferences/', payload);
    }

    static async getAllPreferences() {
        return await this.get('/user-preferences/');
    }

    static async getPreferenceByUserId(userId: string) {
        return await this.get(`/user-preferences/user/${userId}`);
    }

    static async updatePreference(id: string, payload: any) {
        return await this.put(`/user-preferences/${id}`, payload);
    }

    static async deletePreference(id: string) {
        return await this.delete(`/user-preferences/${id}`);
    }

    // User Activities
    static async getAllActivities() {
        return await this.get('/user-activities/');
    }

    static async getMyActivities() {
        return await this.get('/user-activities/me');
    }

    static async getActivityAnalytics() {
        return await this.get('/user-activities/analytics');
    }
}
