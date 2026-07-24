import {ApiService} from "@/core/infrastructure/utilities/api-service";

export class OtpApiService extends ApiService {
    static async createOtp(payload: { phone: string; domain?: string }) {
        return await this.post('/otp/create', payload);
    }

    static async validateOtp(payload: { phone: string; code: string; domain?: string }) {
        return await this.post('/otp/validate', payload);
    }
}
