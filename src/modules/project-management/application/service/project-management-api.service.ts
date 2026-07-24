import {ApiService} from "@/core/infrastructure/utilities/api-service";

export class ProjectManagementApiService extends ApiService {
    // Projects
    static async createProject(payload: any) {
        return await this.post('/project-managementprojects', payload);
    }

    static async getAllProjects() {
        return await this.get('/project-managementprojects');
    }

    static async getGlobalAnalytics() {
        return await this.get('/project-managementanalytics');
    }

    static async getProjectById(id: string) {
        return await this.get(`/project-managementprojects/${id}`);
    }

    static async getProjectAnalytics(id: string) {
        return await this.get(`/project-managementprojects/${id}/analytics`);
    }

    // Tasks
    static async createTask(payload: any) {
        return await this.post('/project-managementtasks', payload);
    }

    static async getTasksByProject(projectId: string) {
        return await this.get(`/project-managementprojects/${projectId}/tasks`);
    }

    static async updateTaskStatus(id: string, status: string) {
        return await this.put(`/project-managementtasks/${id}/status`, { status });
    }
}
