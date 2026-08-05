import {ApiService} from "@/core/infrastructure/utilities/api-service";

export class AccountingApiService extends ApiService {
    // Taxes
    static async createTax(payload: any) {
        return await this.post('/accounting/taxes', payload);
    }

    static async getTaxes() {
        return await this.get('/accounting/taxes');
    }

    static async getTaxById(id: string) {
        return await this.get(`/accounting/taxes/${id}`);
    }

    static async updateTax(id: string, payload: any) {
        return await this.put(`/accounting/taxes/${id}`, payload);
    }

    static async archiveTax(id: string) {
        return await this.post(`/accounting/taxes/${id}/archive`);
    }

    // Accounts
    static async createAccount(payload: any) {
        return await this.post('/accounting/accounts', payload);
    }

    static async getAccounts() {
        return await this.get('/accounting/accounts');
    }

    static async getAccountById(id: string) {
        return await this.get(`/accounting/accounts/${id}`);
    }

    static async updateAccount(id: string, payload: any) {
        return await this.put(`/accounting/accounts/${id}`, payload);
    }

    static async archiveAccount(id: string) {
        return await this.post(`/accounting/accounts/${id}/archive`);
    }

    // Bank Accounts
    static async createBankAccount(payload: any) {
        return await this.post('/accounting/bank-accounts', payload);
    }

    static async getBankAccounts() {
        return await this.get('/accounting/bank-accounts');
    }

    static async getBankAccountById(id: string) {
        return await this.get(`/accounting/bank-accounts/${id}`);
    }

    static async updateBankAccount(id: string, payload: any) {
        return await this.put(`/accounting/bank-accounts/${id}`, payload);
    }

    static async archiveBankAccount(id: string) {
        return await this.post(`/accounting/bank-accounts/${id}/archive`);
    }

    // Journals
    static async createJournal(payload: any) {
        return await this.post('/accounting/journals', payload);
    }

    static async getJournals() {
        return await this.get('/accounting/journals');
    }

    static async getJournalById(id: string) {
        return await this.get(`/accounting/journals/${id}`);
    }

    static async updateJournal(id: string, payload: any) {
        return await this.put(`/accounting/journals/${id}`, payload);
    }

    static async archiveJournal(id: string) {
        return await this.post(`/accounting/journals/${id}/archive`);
    }

    // Journal Entries
    static async createJournalEntry(payload: any) {
        return await this.post('/accounting/journal-entries', payload);
    }

    static async getJournalEntries() {
        return await this.get('/accounting/journal-entries');
    }

    static async getJournalEntryById(id: string) {
        return await this.get(`/accounting/journal-entries/${id}`);
    }

    static async cancelJournalEntry(id: string) {
        return await this.post(`/accounting/journal-entries/${id}/cancel`);
    }

    static async validateJournalEntry(id: string) {
        return await this.post(`/accounting/journal-entries/${id}/validate`);
    }

    static async reverseJournalEntry(id: string) {
        return await this.post(`/accounting/journal-entries/${id}/reverse`);
    }

    // Periods
    static async getPeriods() {
        return await this.get('/accounting/periods');
    }

    static async getPeriodById(id: string) {
        return await this.get(`/accounting/periods/${id}`);
    }

    static async getCurrentPeriod() {
        return await this.get('/accounting/periods/current');
    }

    static async closePeriod(id: string) {
        return await this.post(`/accounting/periods/${id}/close`);
    }

    static async reopenPeriod(id: string) {
        return await this.post(`/accounting/periods/${id}/reopen`);
    }

    // Budgets
    static async createBudget(payload: any) {
        return await this.post('/accounting/budgets', payload);
    }

    static async getBudgets() {
        return await this.get('/accounting/budgets');
    }

    static async getBudgetById(id: string) {
        return await this.get(`/accounting/budgets/${id}`);
    }

    static async updateBudget(id: string, payload: any) {
        return await this.put(`/accounting/budgets/${id}`, payload);
    }

    static async deleteBudget(id: string) {
        return await this.delete(`/accounting/budgets/${id}`);
    }

    // Settings
    static async getSettings() {
        return await this.get('/accounting/settings');
    }

    static async updateSettings(payload: any) {
        return await this.put('/accounting/settings', payload);
    }

    // Reports
    static async getIncomeStatement() {
        return await this.get('/accounting/reports/income-statement');
    }

    static async getBalanceSheet() {
        return await this.get('/accounting/reports/balance-sheet');
    }

    static async getJournalReport() {
        return await this.get('/accounting/reports/journal');
    }

    static async getTrialBalance() {
        return await this.get('/accounting/trial-balance');
    }

    static async getLedger() {
        return await this.get('/accounting/ledger');
    }
}
