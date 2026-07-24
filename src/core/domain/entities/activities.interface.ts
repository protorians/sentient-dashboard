import {UserInterface} from "@/modules/auth/domain/entities/user.interface";

export interface ActivityInterface {
    id: string;
    action: string;
    module: string;
    description?: string;
    describe?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
    organizationId: string;
    createdAt: string;
    user?: UserInterface;
}

export type ActivitiesType = ActivityInterface[];