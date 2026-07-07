import {createDataset} from "@/core/infrastructure/stores/dataset.store";


export interface SignInDatasetInterface {
    identifier: string | undefined;
    password: string | undefined;
}

export const SignInDataset = createDataset<SignInDatasetInterface>({
    identifier: undefined,
    password: undefined,
}, {
    identifier: (v) => {
        if (!v) return "Identifiant requis";
        return null;
    },
    password: (v) => {
        if (!v) return "Mot de passe requis";
        return null;
    }
})