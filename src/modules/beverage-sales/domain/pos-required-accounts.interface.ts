export interface PosRequiredAccountInterface {
    code: string;
    label: string;
    type: string;
    nature: string;
    role: string;
    exists: boolean;
    accountId: string | null;
    isConfigured: boolean;
    settingKey: string;
}

export interface PosRequiredAccountsInterface {
    accounts: PosRequiredAccountInterface[];
    allConfigured: boolean;
}
