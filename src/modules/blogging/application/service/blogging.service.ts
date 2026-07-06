import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export class BloggingService extends FetchService {
    // Posts
    static async createPost(payload: any) {
        return await this.post('/posts/', payload);
    }

    static async getAllPosts() {
        return await this.get('/posts/');
    }

    static async searchPosts(query: string) {
        return await this.get('/posts/search', { q: query });
    }

    static async getPostsByCategory(categoryId: string) {
        return await this.get(`/posts/category/${categoryId}`);
    }

    static async getAnalytics() {
        return await this.get('/posts/analytics');
    }

    static async getPostById(id: string) {
        return await this.get(`/posts/${id}`);
    }

    static async updatePost(id: string, payload: any) {
        return await this.put(`/posts/${id}`, payload);
    }

    static async deletePost(id: string) {
        return await this.delete(`/posts/${id}`);
    }

    static async commitPost(id: string, payload: any) {
        return await this.post(`/posts/${id}/commit`, payload);
    }

    static async publishPost(id: string) {
        return await this.patch(`/posts/${id}/publish`);
    }

    static async unpublishPost(id: string) {
        return await this.patch(`/posts/${id}/unpublish`);
    }

    // Collaborators
    static async addCollaborator(id: string, userId: string) {
        return await this.post(`/posts/${id}/collaborators/${userId}`);
    }

    static async removeCollaborator(id: string, userId: string) {
        return await this.delete(`/posts/${id}/collaborators/${userId}`);
    }

    // Media
    static async addMedia(id: string, mediaId: string) {
        return await this.post(`/posts/${id}/media/${mediaId}`);
    }

    static async removeMedia(id: string, mediaId: string) {
        return await this.delete(`/posts/${id}/media/${mediaId}`);
    }

    // Categories Management
    static async getCategories() {
        return await this.get('/posts/manage/categories');
    }

    static async createCategory(payload: any) {
        return await this.post('/posts/manage/categories', payload);
    }

    static async updateCategory(id: string, payload: any) {
        return await this.put(`/posts/manage/categories/${id}`, payload);
    }

    static async deleteCategory(id: string) {
        return await this.delete(`/posts/manage/categories/${id}`);
    }
}
