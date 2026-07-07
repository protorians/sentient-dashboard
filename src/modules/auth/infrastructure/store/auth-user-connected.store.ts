import {create} from "zustand/react";
import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {OrganizationInterface} from "@/modules/organizations/domain/entities/organization.interface";


export interface AuthUserConnectedStore {
    getCurrentUser?: UserInterface | null
    organizations: OrganizationInterface[]
    currentOrganization?: OrganizationInterface | null
    setCurrentUser: (user: UserInterface | null | undefined) => void
    setOrganizations: (organizations: OrganizationInterface[]) => void
    setCurrentOrganization: (organization: OrganizationInterface | null | undefined) => void
}

export const authUserConnectedStore = create<AuthUserConnectedStore>((setState, getState) => {
    return {
        getCurrentUser: undefined,
        organizations: [],
        currentOrganization: undefined,
        setCurrentUser: (user: UserInterface | null | undefined) => setState({getCurrentUser: user}),
        setOrganizations: (organizations: OrganizationInterface[]) => setState({organizations}),
        setCurrentOrganization: (organization: OrganizationInterface | null | undefined) => setState({currentOrganization: organization}),
    }
})