import {ApiService} from "@/core/infrastructure/utilities/api-service";

export class ModuleActivationApiService extends ApiService {
    // Modules
    static async getModules() {
        return await this.get('/module-activation/modules');
    }

    static async createModule(payload: any) {
        return await this.post('/module-activation/modules', payload);
    }

    static async getModuleById(moduleId: string) {
        return await this.get(`/module-activation/modules/${moduleId}`);
    }

    static async deleteModule(moduleId: string) {
        return await this.delete(`/module-activation/modules/${moduleId}`);
    }

    // Serial Keys
    static async getSerialKeys(moduleId: string) {
        return await this.get(`/module-activation/modules/${moduleId}/serial-keys`);
    }

    static async createSerialKey(moduleId: string, payload: any) {
        return await this.post(`/module-activation/modules/${moduleId}/serial-keys`, payload);
    }

    static async deleteSerialKey(keyId: string) {
        return await this.delete(`/module-activation/serial-keys/${keyId}`);
    }

    // Organizations
    static async getOrganizationModules(orgId: string) {
        return await this.get(`/module-activation/organizations/${orgId}/modules`);
    }

    static async activateOrganizationModule(orgId: string, payload: any) {
        return await this.post(`/module-activation/organizations/${orgId}/activate`, payload);
    }

    static async validateOrganizationModule(orgId: string, moduleId: string) {
        return await this.get(`/module-activation/organizations/${orgId}/modules/${moduleId}/validate`);
    }

    static async deactivateOrganizationModule(orgId: string, moduleId: string) {
        return await this.delete(`/module-activation/organizations/${orgId}/modules/${moduleId}`);
    }
}
