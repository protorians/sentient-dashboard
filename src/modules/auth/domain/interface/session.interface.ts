
export interface CreateUserSessionInterface {
    username: string;
    password: string;
}

export interface CreateUserAccountInterface {
    username?: string;
    email: string;
    password: string;
    password_confirmation: string;
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