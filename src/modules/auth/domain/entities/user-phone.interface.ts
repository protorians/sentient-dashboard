export interface UserPhoneInterface {
    id?: string;
    userId: string;
    prefix: string;
    phone: string;
    type?: 'MOBILE' | 'FIX' | 'FAX';
    isDefault?: boolean;
    status?: boolean;
    deletedAt?: Date;
    auditId: string;
}
