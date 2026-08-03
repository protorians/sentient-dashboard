import {UserStatusEnum} from "@/modules/auth/domain/enums/user-status.enum";
import {PaginationWithSearchOptions} from "@/core/domain/typing/response";
import {UserPhoneInterface} from "@/modules/auth/domain/entities/user-phone.interface";

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

export interface PermissionCapabilityInterface {
    read: boolean;
    create: boolean;
    delete: boolean;
    update: boolean;
}

export type PermissionsCapabilitiesInterface = Record<string, PermissionCapabilityInterface>;

export type UserPermissionCapabilities = PermissionsCapabilitiesInterface;

export interface RoleInterface {
    id?: string;
    name: string;
    color?: string;
    permissions: PermissionsCapabilitiesInterface;
    status?: boolean;
    deletedAt?: Date;
    organizationId: string;
}

export interface PreferenceInterface {
    id?: string;
    key?: string;
    value?: string;
    userId?: string;
    isEnabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserInterface {
    id?: string;
    email?: string;
    username: string;
    passwordId?: string;
    status?: UserStatusEnum;
    deletedAt?: Date;
    auditId: string;
    avatarId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userData?: UserDataInterface;
    userPhones?: UserPhoneInterface[];
    roles?: RoleInterface[];
    preferences?: PreferenceInterface[];
    permissions?: Record<string, PermissionCapabilityInterface>;
}

export interface UserFilter {
    username?: string;
    email?: string;
    phone?: string;
    status?: UserStatusEnum;
}

export type GetAllUsersFilterOptions = PaginationWithSearchOptions & UserFilter;