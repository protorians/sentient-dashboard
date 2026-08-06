export interface ProductCategoryInterface {
    id?: string;
    name: string;
    description?: string | null;
    status?: boolean;
    organizationId?: string;
    auditId?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
}

export interface CreateProductCategoryInterface {
    name: string;
    description?: string;
}

export interface UpdateProductCategoryInterface {
    name?: string;
    description?: string;
    status?: boolean;
}
