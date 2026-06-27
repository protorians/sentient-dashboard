import {createDataset} from "@/core/infrastructure/stores/dataset.store";


export interface SignUpDatasetInterface {
    firstname: string | undefined;
    lastname: string | undefined;
    email: string | undefined;
    password: string | undefined;
    password_confirmation: string | undefined;
}

export const SignUpDataset = createDataset<SignUpDatasetInterface>({
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    password: undefined,
    password_confirmation: undefined,
}, {
    firstname: (v) => (!v ? "Prénom requis" : null),
    lastname: (v) => (!v ? "Nom requis" : null),
    email: (v) => {
        if (!v) return "Email requis";
        const re = /\S+@\S+\.\S+/;
        return re.test(v) ? null : "Email invalide";
    },
    password: (v) => {
        if (!v) return "Mot de passe requis";
        if (typeof v === 'string' && v.length < 6) return "Mot de passe trop court (>=6)";
        return null;
    },
    password_confirmation: (v) => (!v ? "Confirmation requise" : null),
})