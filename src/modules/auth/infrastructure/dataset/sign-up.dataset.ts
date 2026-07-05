import {createDataset} from "@/core/infrastructure/stores/dataset.store";


export interface SignUpDatasetInterface {
    username?: string;
    email: string | undefined;
    password: string | undefined;
    password_confirmation: string | undefined;
    first_names?: string;
    last_name?: string;
    phone?: string;
    otp?: string;
    country?: string;
    city?: string;
    address?: string;
    gender?: string;
    birth_date?: string;
    organization?: string;
    idRecto?: any;
    idVerso?: any;
    selfie?: any;
}

export const SignUpDataset = createDataset<SignUpDatasetInterface>({
    username: undefined,
    email: undefined,
    password: undefined,
    password_confirmation: undefined,
    first_names: undefined,
    last_name: undefined,
    phone: undefined,
    otp: undefined,
    country: undefined,
    city: undefined,
    address: undefined,
    gender: undefined,
    birth_date: undefined,
    organization: undefined,
    idRecto: undefined,
    idVerso: undefined,
    selfie: undefined,
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
    },
    password_confirmation: (v) => (!v ? "Confirmation requise" : null),
    first_names: (v) => (!v ? "Prénom(s) requis" : null),
    last_name: (v) => (!v ? "Nom requis" : null),
    organization: (v) => (!v ? "organization requise" : null),
    phone: (v) => {
        if (!v) return "Numéro de téléphone requis";
        if (!/^\+?[0-9\s\-()]{10,}$/.test(v)) return "Numéro de téléphone invalide";
        return null;
    },
    otp: (v) => (!v ? "Code OTP requis" : null),
})