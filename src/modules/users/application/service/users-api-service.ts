import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {CreateUserInterface, UserAnalyticsInterface} from "@/modules/users/domain/users.interface";
import {FetchResponseInterface, FetchResponseWithMetaInterface, PaginationWithSearchOptions} from "@/core/domain/typing/response";
import {ActivitiesType} from "@/core/domain/entities/activities.interface";
import {GetAllUsersFilterOptions, UserFilter, UserInterface} from "@/modules/auth/domain/entities/user.interface";

export class UsersApiService extends ApiService {
    // Users
    static async getAll(options?: GetAllUsersFilterOptions) {
        return await this.get<FetchResponseWithMetaInterface<UserInterface[]>>('/users/', options);
    }

    static async create(payload: CreateUserInterface & { organizationId: string }) {
        return await this.post<FetchResponseInterface<UserInterface>>('/users', payload);
    }

    static async getById(id: string) {
        return await this.get(`/users/${id}`);
    }

    static async update(id: string, payload: Partial<CreateUserInterface>) {
        return await this.put<FetchResponseInterface<UserInterface>>(`/users/${id}`, payload);
    }

    static async findByContact(payload: { email?: string; phone?: string; username?: string }) {
        return await this.post<FetchResponseInterface<UserInterface>>('/users/find-by-contact', payload);
    }

    static async getAnalytics() {
        return await this.get<FetchResponseInterface<UserAnalyticsInterface>>('/users/analytics');
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
        return await this.get<FetchResponseInterface<ActivitiesType>>('/user-activities/');
    }

    static async getMyActivities() {
        return await this.get<FetchResponseInterface<ActivitiesType>>('/user-activities/me');
    }

    static async getActivityAnalytics() {
        return await this.get('/user-activities/analytics');
    }

    static async deleteUnique(id: string) {
        return await this.delete(`/users/delete/${id}`);
    }

    static async deleteMany(ids: string[]) {
        return await this.delete(`/users/deleteMany`, {
            ids: ids
        });
    }
}
