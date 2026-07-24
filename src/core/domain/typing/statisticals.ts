import {DeviseType} from "@/core/domain/typing/devise";

export interface StatisticalProps{
    label?: string;
    amount: number;
    devise?: DeviseType;
    trend?: number;
    description?: string;
    color?: string;
    fill?: string;
}
