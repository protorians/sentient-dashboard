export type PosWeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export const POS_WEEK_DAYS: PosWeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export interface PosTimeSlotInterface {
    start: string;
    end: string;
}

export interface PosScheduleInterface {
    openingHour: string;
    closingHour: string;
    breakHour: string;
    morningHours: PosTimeSlotInterface;
    afternoonHours: PosTimeSlotInterface;
    workingDays: PosWeekDay[];
    open24h: boolean;
    open7d: boolean;
}

export interface PosPreferencesInterface {
    schedule: PosScheduleInterface;
}

export interface UpdatePosPreferencesInterface {
    openingHour?: string;
    closingHour?: string;
    breakHour?: string;
    morningHours?: PosTimeSlotInterface;
    afternoonHours?: PosTimeSlotInterface;
    workingDays?: PosWeekDay[];
    open24h?: boolean;
    open7d?: boolean;
}

export type PosDayPart = 'matin' | 'pause' | 'après-midi' | 'hors-horaires' | 'fermé';

export interface PosOpenStatusInterface {
    isOpen: boolean;
    date: string;
    dayPart: PosDayPart;
    nextOpening: string | null;
    schedule: PosScheduleInterface;
}
