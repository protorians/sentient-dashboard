export interface CustomerInterface {
    id: string;
    organizationId: string;
    type?: string;
    civility?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    status?: boolean;
    createdAt?: string;
}

export enum CustomerType {
    PERSON = 'PERSON',
    COMPANY = 'COMPANY',
}

export interface OrderCustomerPayload {
    name?: string;
    phone?: string;
    email?: string;
}

export interface CreateCustomerInterface {
    type: CustomerType;
    firstname?: string;
    lastname?: string;
    companyName?: string;
    civility?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    taxNumber?: string;
    userId?: string;
}
