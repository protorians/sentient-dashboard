import {UserGenderEnum} from "@/modules/users/domain/enums/user-gender.enum";

export interface UserStatsSummaryInterface {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
}

export interface UserStatsRoleInterface {
    role: string;
    count: number;
}

export interface UserStatsOverTimeInterface {
    date: string;
    count: number;
}

export interface UserAnalyticsInterface {
    summary: UserStatsSummaryInterface;
    usersByRole?: UserStatsRoleInterface[];
    usersOverTime?: UserStatsOverTimeInterface[];
}


export interface CreateUserInterface {
    username?: string;
    password?: string;
    password_confirmation?: string;
    email: string;
    first_names?: string;
    last_name?: string;
    phone?: string;
    otp?: string;
    country?: string;
    city?: string;
    address?: string;
    gender?: UserGenderEnum;
    birthDate?: string;
    // idRecto?: any;
    // idVerso?: any;
    // selfie?: any;
    organization?: any;
}