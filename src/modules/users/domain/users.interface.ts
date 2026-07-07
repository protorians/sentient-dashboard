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
