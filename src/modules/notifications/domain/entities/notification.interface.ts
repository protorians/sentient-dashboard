export enum NotificationTypeEnum {
    ALERT = "ALERT",
    INFORMATION = "INFORMATION",
    CONFIRMATION = "CONFIRMATION",
    REMINDER = "REMINDER",
    SECURITY = "SECURITY",
}

export interface NotificationInterface {
    id: string;
    title?: string;
    subject?: string;
    body?: string;
    message?: string;
    content?: string;
    type?: NotificationTypeEnum | string;
    // isRead?: boolean;
    // read?: boolean;
    readAt?: string | null;
    organizationId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
