
export type UserMediaFieldKey = 'avatar' | 'idRecto' | 'idVerso' | 'selfie';

export interface UserMediaFieldConfig {
    key: UserMediaFieldKey;
    label: string;
    description: string;
    type: string;
}
