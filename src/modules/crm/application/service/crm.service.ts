import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export class CrmService extends FetchService {
    // Contacts
    static async createContact(payload: any) {
        return await this.post('/crm/contacts', payload);
    }

    static async getAllContacts() {
        return await this.get('/crm/contacts');
    }

    static async getContactById(id: string) {
        return await this.get(`/crm/contacts/${id}`);
    }

    // Companies
    static async createCompany(payload: any) {
        return await this.post('/crm/companies', payload);
    }

    static async getAllCompanies() {
        return await this.get('/crm/companies');
    }

    static async getCompanyById(id: string) {
        return await this.get(`/crm/companies/${id}`);
    }

    // Reminders
    static async createReminder(payload: any) {
        return await this.post('/crm/reminders', payload);
    }

    static async getAnalytics() {
        return await this.get('/crm/analytics');
    }
}
