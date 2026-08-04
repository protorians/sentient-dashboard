import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {MediaLabelService} from "@/core/infrastructure/utilities/media-label.service";
import type {MediaSection, MediaUploadOptions} from "@/core/domain/entities/media";
import type {AxiosProgressEvent, AxiosRequestConfig} from "axios";

export class StorageApiService extends ApiService {
    static async uploadFile(file: File, options?: MediaUploadOptions, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void, config?: AxiosRequestConfig<any>) {
        const formData = new FormData();
        formData.append("file", file);

        if (options?.module) formData.append("module", options.module);
        if (options?.type) formData.append("type", options.type);

        const section: MediaSection = options?.isDocument
            ? "document"
            : (options?.section as MediaSection | undefined) ?? MediaLabelService.sectionFor({mime: file.type, extension: file.name.split(".").pop()});
        const label = MediaLabelService.build(options?.module ?? "", section, options?.type);
        formData.append("label", label);

        return await super.upload('/storages/upload', formData, onUploadProgress, config);
    }

    static async getAll() {
        return await this.get('/storages/');
    }

    static async getById(id: string) {
        return await this.get(`/storages/${id}`);
    }

    static async updateStorage(id: string, payload: Record<string, any>) {
        return await this.put(`/storages/${id}`, payload);
    }

    static async deleteStorage(id: string) {
        return await this.delete(`/storages/${id}`);
    }

    static async getFile(id: string, config?: AxiosRequestConfig<any>) {
        return await this.get(`/storages/${id}/file`, undefined, config);
    }

    static async getPublicFile(id: string) {
        return await this.get(`/storages/public/${id}/file`);
    }

    static async createDocument(userId: string, payload: Record<string, any>) {
        return await this.post(`/storages/documents/${userId}`, payload);
    }

    static async getDocumentsByUser(userId: string) {
        return await this.get(`/storages/documents/${userId}`);
    }

    static async getDocument(userId: string, documentId: string) {
        return await this.get(`/storages/documents/${userId}/${documentId}`);
    }

    static async updateDocument(userId: string, documentId: string, payload: Record<string, any>) {
        return await this.put(`/storages/documents/${userId}/${documentId}`, payload);
    }

    static async deleteDocument(userId: string, documentId: string) {
        return await this.delete(`/storages/documents/${userId}/${documentId}`);
    }

    static async hasDocument(type: string) {
        return await this.get('/storages/documents/me/has-document', { type });
    }

    static async hasDocumentForUser(userId: string, type: string) {
        return await this.get(`/storages/documents/${userId}/has-document`, { type });
    }
}
