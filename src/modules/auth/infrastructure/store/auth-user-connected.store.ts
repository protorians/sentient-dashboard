import {create} from "zustand/react";
import {UserInterface} from "@/modules/auth/domain/entities/user.interface";


export interface AuthUserConnectedStore {
    getCurrentUser?: UserInterface
    setCurrentUser: (user: UserInterface) => void
}

export const authUserConnectedStore = create<AuthUserConnectedStore>((setState, getState) => {
    return {
        getCurrentUser: undefined,
        setCurrentUser: (user: UserInterface) => setState({getCurrentUser: user}),
    }
})