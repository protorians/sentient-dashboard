import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {CategoryVm, CreateCategoryInterface, CreatePostInterface, UpdateCategoryInterface, UpdatePostInterface} from "@/modules/blogging/domain/blogging.interface";

export class BloggingApiService extends ApiService {
    static async createPost(payload: CreatePostInterface) {
        return await this.post('/posts/', payload as unknown as Record<string, unknown>);
    }

    static async getAllPosts(options?: Record<string, unknown>) {
        return await this.get('/posts/', options);
    }

    static async searchPosts(query: string, options?: Record<string, unknown>) {
        return await this.get('/posts/search', { q: query, ...options });
    }

    static async getPostsByCategory(categoryId: string, options?: Record<string, unknown>) {
        return await this.get(`/posts/category/${categoryId}`, options);
    }

    static async getAnalytics(options?: Record<string, unknown>) {
        return await this.get('/posts/analytics', options);
    }

    static async getPostById(id: string) {
        return await this.get(`/posts/${id}`);
    }

    static async updatePost(id: string, payload: UpdatePostInterface) {
        return await this.put(`/posts/${id}`, payload as unknown as Record<string, unknown>);
    }

    static async deletePost(id: string) {
        return await this.delete(`/posts/${id}`);
    }

    static async publishPost(id: string) {
        return await this.post(`/posts/${id}/publish`);
    }

    static async unpublishPost(id: string) {
        return await this.post(`/posts/${id}/unpublish`);
    }

    static async commitPost(id: string, payload: Record<string, unknown>) {
        return await this.post(`/posts/${id}/commit`, payload);
    }

    static async addCollaborator(postId: string, userId: string) {
        return await this.post(`/posts/${postId}/collaborators/${userId}`);
    }

    static async removeCollaborator(postId: string, userId: string) {
        return await this.delete(`/posts/${postId}/collaborators/${userId}`);
    }

    static async addMedia(postId: string, mediaId: string) {
        return await this.post(`/posts/${postId}/media/${mediaId}`);
    }

    static async removeMedia(postId: string, mediaId: string) {
        return await this.delete(`/posts/${postId}/media/${mediaId}`);
    }

    static async getCategories(options?: Record<string, unknown>) {
        return await this.get('/posts/manage/categories', options);
    }

    static async createCategory(payload: CreateCategoryInterface) {
        return await this.post('/posts/manage/categories', payload as unknown as Record<string, unknown>);
    }

    static async updateCategory(id: string, payload: UpdateCategoryInterface) {
        return await this.put(`/posts/manage/categories/${id}`, payload as unknown as Record<string, unknown>);
    }

    static async deleteCategory(id: string) {
        return await this.delete(`/posts/manage/categories/${id}`);
    }
}
