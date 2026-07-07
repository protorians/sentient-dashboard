import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {StackableEntityType} from "@/core/infrastructure/capabilities/stackable/types";
import {OrganizationInterface} from "@/modules/organizations/domain/entities/organization.interface";

export interface AuthCacheInterface extends StackableEntityType{
    user: UserInterface | null;
    token: string | null;
    device: string | null;
    organizations: OrganizationInterface[] | null;
    currentOrganization: OrganizationInterface | null;
    apiKey: string | null;
}
