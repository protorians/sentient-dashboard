
export interface RolesSummaryMetadataInterface{
    name: string;
    color: string;
    description?: string;
}

export interface RolesSummaryStatsInterface{
    totalDomains: number;
    creatable: number;
    readable: number;
    updatable: number;
    deletable: number;
    fullAccess: number;
    blocked: number;
}

export interface RolesSummaryInterface{
    metadata: RolesSummaryMetadataInterface;
    stats: RolesSummaryStatsInterface;
}

export type RolesSummaryType = {
    [Role: string]: RolesSummaryInterface
}


