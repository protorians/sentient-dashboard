"use client"

import React, {useMemo} from "react";
import {PosOpenStatusInterface, PosDayPart, PosScheduleInterface} from "@/modules/beverage-sales/domain/pos-preferences.interface";
import {Badge} from "@/core/presentation/ui/badge";
import {Card} from "@/core/presentation/ui/card";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {cn} from "@/core/infrastructure/utilities/utils";
import {CircleCheckIcon, CircleXIcon, ClockIcon, SettingsIcon} from "lucide-react";
import Link from "next/link";

interface RegisterStatusBannerProps {
    status: PosOpenStatusInterface | null | undefined;
    isLoading?: boolean;
}

const DAY_PART_LABELS: Record<PosDayPart, string> = {
    'matin': 'Matin',
    'pause': 'Pause',
    'après-midi': 'Après-midi',
    'hors-horaires': 'Hors horaires',
    'fermé': 'Fermé',
};

const WEEK_DAYS_LABELS: Record<string, string> = {
    MON: 'Lundi',
    TUE: 'Mardi',
    WED: 'Mercredi',
    THU: 'Jeudi',
    FRI: 'Vendredi',
    SAT: 'Samedi',
    SUN: 'Dimanche',
};

function formatTime(iso: string | null): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function scheduleSummary(schedule: PosScheduleInterface): string {
    const parts: string[] = [];
    if (schedule.open24h) {
        parts.push('Ouvert 24h/24');
    } else {
        parts.push(`${schedule.openingHour} – ${schedule.closingHour}`);
    }
    if (schedule.open7d) {
        parts.push('7j/7');
    } else {
        const days = schedule.workingDays.map(d => WEEK_DAYS_LABELS[d] ?? d);
        parts.push(days.length === 7 ? '7j/7' : days.join(', '));
    }
    return parts.join(' · ');
}

export function RegisterStatusBanner({status, isLoading}: RegisterStatusBannerProps) {
    const summary = useMemo(() => (status?.schedule ? scheduleSummary(status.schedule) : ''), [status]);

    if (isLoading && !status) {
        return (
            <Card className="p-4 border-none shadow-sm flex items-center gap-3">
                <WaitingActivity size={18}/>
                <span className="text-sm text-muted-foreground">Vérification de l&apos;état de la caisse...</span>
            </Card>
        );
    }

    if (!status) return null;

    const isOpen = status.isOpen;

    return (
        <div className={cn(
            "p-4 border-none shadow-sm flex items-center gap-3 rounded-xl",
            isOpen ? "bg-emerald-500/5" : "bg-amber-500/5"
        )}>
            <div className={cn(
                "rounded-full p-1.5 shrink-0",
                isOpen ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
            )}>
                {isOpen ? <CircleCheckIcon className="size-5"/> : <CircleXIcon className="size-5"/>}
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                        "text-sm font-bold",
                        isOpen ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                    )}>
                        {isOpen ? "Caisse ouverte" : "Caisse fermée"}
                    </span>
                    <Badge variant={isOpen ? "default" : "secondary"}>
                        {DAY_PART_LABELS[status.dayPart]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{summary}</span>
                </div>
                {!isOpen && (
                    <span className="text-xs text-muted-foreground">
                        <ClockIcon className="inline size-3 mr-1 -mt-0.5"/>
                        {status.nextOpening
                            ? `Prochaine ouverture : ${formatTime(status.nextOpening)}`
                            : "Aucune prochaine ouverture planifiée."}
                    </span>
                )}
            </div>
            <Link
                href="/beverage-sales/settings/register"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
                <SettingsIcon className="size-3.5"/>
                Préférences
            </Link>
        </div>
    );
}
