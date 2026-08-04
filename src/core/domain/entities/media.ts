export interface MediaStorageInterface {
    id?: string;
    filename: string;
    type: string;
    label: string;
    metadata?: any;
    organizationId: string;
    status?: boolean;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MediaUploadOptions {
    section?: string;
    module?: string;
    type?: string;
    isDocument?: boolean;
}

export const MEDIA_SECTIONS = ["document", "image", "video", "audio", "autre"] as const;
export type MediaSection = (typeof MEDIA_SECTIONS)[number];