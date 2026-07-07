export interface OrganizationInterface {
    id: string;
    name: string;
    logo?: string;
    description: string;
    enabledModules: string[];
    status: boolean;
    auditId: string;
}

export interface OrganizationApiAccessResponseInterface{
    id: string;
    publicKeys: string[];
}