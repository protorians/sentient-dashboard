import {createDataset} from "@/core/infrastructure/stores/dataset.store";


export interface SignInDatasetInterface {
    email: string | undefined;
    password: string | undefined;
}

export const SignInDataset = createDataset<SignInDatasetInterface>({
    email: undefined,
    password: undefined,
}, {
    email: (v) => {
        if (!v) return "Email requis";
        const re = /\S+@\S+\.\S+/;
        return re.test(v) ? null : "Email invalide";
    },
    password: (v) => {
        if (!v) return "Mot de passe requis";
        if (typeof v === 'string' && v.length < 6) return "Mot de passe trop court (>=6)";
        return null;
    }
})