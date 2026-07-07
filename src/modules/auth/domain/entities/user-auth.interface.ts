import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {OrganizationInterface} from "@/modules/organizations/domain/entities/organization.interface";

export interface UserAuthResponseInterface {
    user: UserInterface;
    token: string;
    device: string;
    organizations: OrganizationInterface[]
}
