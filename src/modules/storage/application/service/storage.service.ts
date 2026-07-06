import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export class StorageService extends FetchService {
    static async upload(formData: FormData) {
        return await this.post('/storages/upload', formData as any, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async getAll() {
        return await this.get('/storages/');
    }

    static async getById(id: string) {
        return await this.get(`/storages/${id}`);
    }

    static async deleteStorage(id: string) {
        return await this.delete(`/storages/${id}`);
    }

    static async getUrl(id: string) {
        return await this.get(`/storages/u/${id}`);
    }
}
