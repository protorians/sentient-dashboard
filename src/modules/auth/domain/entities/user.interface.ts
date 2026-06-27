export interface UserDataInterface {
    id?: string;
    firstname?: string;
    lastname?: string;
    country?: string;
    city?: string;
    address?: string;
    gender?: string;
    birthDate?: Date;
    idRectoId?: string;
    idVersoId?: string;
    selfieId?: string;
}

export interface UserInterface {
    id?: string;
    email?: string;
    username: string;
    phone?: string;
    auditId: string;
    createdAt?: Date;
    updatedAt?: Date;
    userData?: UserDataInterface;
}