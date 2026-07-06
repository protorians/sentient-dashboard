import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export class OtpService extends FetchService {
    static async createOtp(payload: { phone: string; domain?: string }) {
        return await this.post('/otp/create', payload);
    }

    static async validateOtp(payload: { phone: string; code: string; domain?: string }) {
        return await this.post('/otp/validate', payload);
    }
}
