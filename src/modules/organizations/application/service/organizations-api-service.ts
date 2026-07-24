import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {FetchResponseInterface} from "@/core/domain/typing/response";
import {OrganizationApiAccessResponseInterface} from "@/modules/organizations/domain/entities/organization.interface";

export class OrganizationsApiService extends ApiService {
    // Organizations
    static async create(payload: any) {
        return await this.post('/organizations/', payload);
    }

    static async getAll() {
        return await this.get('/organizations/');
    }

    static async getById(id: string) {
        return await this.get(`/organizations/${id}`);
    }

    static async deleteOrganization(id: string) {
        return await this.delete(`/organizations/${id}`);
    }

    static async updateModules(id: string, modules: string[]) {
        return await this.put(`/organizations/${id}/modules`, { modules });
    }

    static async getModulesList() {
        return await this.get('/organizations/modules/list');
    }

    static async addMember(id: string, member: any) {
        return await this.post(`/organizations/${id}/members`, member);
    }

    static async getMembers(id: string) {
        return await this.get(`/organizations/${id}/members`);
    }

    static async removeMember(id: string, userId: string) {
        return await this.delete(`/organizations/${id}/members/${userId}`);
    }

    static async createApiKey(id: string, data: any) {
        return await this.post(`/organizations/${id}/api-keys`, data);
    }

    static async getApiKeys(id: string) {
        return await this.get(`/organizations/${id}/api-keys`);
    }

    static async getApiAccess(id: string) {
        return await this.get<FetchResponseInterface<OrganizationApiAccessResponseInterface>>(`/organizations/public/${id}/api/access`);
    }

    static async deleteApiKey(keyId: string) {
        return await this.delete(`/organizations/api-keys/${keyId}`);
    }

    static async verifyApiKey(data: any) {
        return await this.post('/organizations/api-keys/verify', data);
    }

    // Organization Preferences
    static async createPreference(payload: any) {
        return await this.post('/organization-preferences/', payload);
    }

    static async getAllPreferences() {
        return await this.get('/organization-preferences/');
    }

    static async getPreferenceByOrgId(organizationId: string) {
        return await this.get(`/organization-preferences/organization/${organizationId}`);
    }

    static async updatePreference(id: string, payload: any) {
        return await this.put(`/organization-preferences/${id}`, payload);
    }

    static async deletePreference(id: string) {
        return await this.delete(`/organization-preferences/${id}`);
    }
}
