import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {OrganizationInterface} from "@/modules/organizations/domain/entities/organization.interface";

export interface UserAuthResponseInterface {
    user: UserInterface;
    token: string;
    device: string;
    organizations: OrganizationInterface[]
}

export interface UserAuthSessionCheckingResponseInterface {
    "id": string;
    "device": string;
    "token": string;
    "userAgent": string;
    "expiredAt": string;
}