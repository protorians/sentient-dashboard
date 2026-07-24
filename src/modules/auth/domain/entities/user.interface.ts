import {DomainsEnum} from "@/core/domain/enums/domains.enum";
import {UserStatusEnum} from "@/modules/auth/domain/enums/user-status.enum";

export interface UserDataInterface {
    id?: string;
    firstname?: string;
    lastname?: string;
    country?: string;
    city?: string;
    address?: string;
    gender?: string;
    birthDate?: Date;
    idRectoId?: string;
    idVersoId?: string;
    selfieId?: string;
}

export interface UserInterface {
    id: string;
    email?: string;
    username: string;
    phone?: string;
    auditId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userData?: UserDataInterface;
    permissions: UserPermissionCapabilities;
    roles: UserRole[];
    status: UserStatusEnum;
}

export type UserPermissionCapabilities = Record<DomainsEnum, UserPermissionCapability>;

export interface UserPermissionCapability {
    read: boolean;
    create: boolean;
    delete: boolean;
    update: boolean;
}

export interface UserRole{
    name: string;
    id: string;
    permissions: UserPermissionCapabilities;
}
