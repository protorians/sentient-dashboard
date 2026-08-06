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

export interface CreateCustomerInterface {
    name: string;
    phone?: string;
    email?: string;
}
