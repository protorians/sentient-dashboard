"use client"

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {
    PosPreferencesInterface,
    PosScheduleInterface,
    PosWeekDay,
} from "@/modules/beverage-sales/domain/pos-preferences.interface";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";
import {AnimatedContent} from "@/core/presentation/animated-content";
import {Button} from "@/core/presentation/ui/button";
import {Label} from "@/core/presentation/ui/label";
import {Input} from "@/core/presentation/ui/input";
import {Switch} from "@/core/presentation/ui/switch";
import {Badge} from "@/core/presentation/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {cn} from "@/core/infrastructure/utilities/utils";
import {toast} from "sonner";
import {
    ArrowRightIcon,
    CalendarDaysIcon,
    CircleCheckIcon,
    CircleXIcon,
    ClockIcon,
    CoffeeIcon,
    EyeIcon,
    InfoIcon,
    RotateCcwIcon,
    SaveIcon,
    Settings2Icon,
    SunIcon,
    SunsetIcon,
} from "lucide-react";

const WEEK_DAYS_LABELS: { value: PosWeekDay; label: string; shortLabel: string }[] = [
    {value: 'MON', label: 'Lundi', shortLabel: 'Lun'},
    {value: 'TUE', label: 'Mardi', shortLabel: 'Mar'},
    {value: 'WED', label: 'Mercredi', shortLabel: 'Mer'},
    {value: 'THU', label: 'Jeudi', shortLabel: 'Jeu'},
    {value: 'FRI', label: 'Vendredi', shortLabel: 'Ven'},
    {value: 'SAT', label: 'Samedi', shortLabel: 'Sam'},
    {value: 'SUN', label: 'Dimanche', shortLabel: 'Dim'},
];

const WEEKDAY_BY_INDEX: PosWeekDay[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DEFAULT_SCHEDULE: PosScheduleInterface = {
    openingHour: '08:00',
    closingHour: '22:00',
    breakHour: '12:00',
    morningHours: {start: '08:00', end: '12:00'},
    afternoonHours: {start: '14:00', end: '22:00'},
    workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    open24h: false,
    open7d: false,
};

function schedulesEqual(a: PosScheduleInterface, b: PosScheduleInterface): boolean {
    return a.openingHour === b.openingHour
        && a.closingHour === b.closingHour
        && a.breakHour === b.breakHour
        && a.morningHours.start === b.morningHours.start
        && a.morningHours.end === b.morningHours.end
        && a.afternoonHours.start === b.afternoonHours.start
        && a.afternoonHours.end === b.afternoonHours.end
        && [...a.workingDays].sort().join(',') === [...b.workingDays].sort().join(',')
        && a.open24h === b.open24h
        && a.open7d === b.open7d;
}

function dayState(schedule: PosScheduleInterface, day: PosWeekDay): { open: boolean; label: string } {
    const isWorking = schedule.open7d || schedule.workingDays.includes(day);
    if (!isWorking) return {open: false, label: 'Fermé'};
    if (schedule.open24h) return {open: true, label: '24h/24'};
    return {open: true, label: `${schedule.openingHour} – ${schedule.closingHour}`};
}

interface SectionCardProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
}

function SectionCard({icon, title, description, children}: SectionCardProps) {
    return (
        <Card className="border-border/70 shadow-sm">
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-muted/70 p-2 text-muted-foreground">
                        {icon}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                        {description && (
                            <CardDescription className="text-xs">{description}</CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

interface TimeFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

function TimeField({id, label, value, onChange, disabled}: TimeFieldProps) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
            <Input
                id={id}
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-28 text-center"
            />
        </div>
    );
}

interface TimeRangeRowProps {
    icon: React.ReactNode;
    label: string;
    hint?: string;
    startValue: string;
    endValue: string;
    onStartChange: (value: string) => void;
    onEndChange: (value: string) => void;
    disabled?: boolean;
}

function TimeRangeRow({
    icon,
    label,
    hint,
    startValue,
    endValue,
    onStartChange,
    onEndChange,
    disabled,
}: TimeRangeRowProps) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-background p-1.5 text-muted-foreground ring-1 ring-border/60">
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{label}</span>
                    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
                </div>
            </div>
            <div className="flex items-center gap-2 pl-10 sm:pl-0">
                <Input
                    type="time"
                    value={startValue}
                    onChange={(e) => onStartChange(e.target.value)}
                    disabled={disabled}
                    className="w-28"
                />
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground"/>
                <Input
                    type="time"
                    value={endValue}
                    onChange={(e) => onEndChange(e.target.value)}
                    disabled={disabled}
                    className="w-28"
                />
            </div>
        </div>
    );
}

export default function RegisterSettingsView() {
    const [schedule, setSchedule] = useState<PosScheduleInterface>(DEFAULT_SCHEDULE);
    const [isSaving, setIsSaving] = useState(false);

    const {data: preferences, isLoading, refetch} = useQuery<PosPreferencesInterface | null>({
        queryKey: ['beverage-sales', 'pos-preferences'],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getPosPreferences();
            return response.data?.data ?? null;
        },
    });

    const originalSchedule = useMemo(() => {
        if (!preferences?.schedule) return null;
        return {
            ...preferences.schedule,
            morningHours: {...preferences.schedule.morningHours},
            afternoonHours: {...preferences.schedule.afternoonHours},
            workingDays: [...preferences.schedule.workingDays],
        };
    }, [preferences?.schedule]);

    useEffect(() => {
        if (originalSchedule) {
            setSchedule(originalSchedule);
        }
    }, [originalSchedule]);

    const isDirty = useMemo(() => {
        return !!originalSchedule && !schedulesEqual(schedule, originalSchedule);
    }, [schedule, originalSchedule]);

    const updateField = useCallback(<K extends keyof PosScheduleInterface>(key: K, value: PosScheduleInterface[K]) => {
        setSchedule(prev => ({...prev, [key]: value}));
    }, []);

    const updateSlot = useCallback((key: 'morningHours' | 'afternoonHours', field: 'start' | 'end', value: string) => {
        setSchedule(prev => ({
            ...prev,
            [key]: {...prev[key], [field]: value},
        }));
    }, []);

    const toggleDay = useCallback((day: PosWeekDay) => {
        setSchedule(prev => {
            const checked = prev.workingDays.includes(day);
            const days = checked
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day];
            return {...prev, workingDays: days};
        });
    }, []);

    const handleReset = useCallback(() => {
        setSchedule(originalSchedule ? {
            ...originalSchedule,
            morningHours: {...originalSchedule.morningHours},
            afternoonHours: {...originalSchedule.afternoonHours},
            workingDays: [...originalSchedule.workingDays],
        } : {...DEFAULT_SCHEDULE, morningHours: {...DEFAULT_SCHEDULE.morningHours}, afternoonHours: {...DEFAULT_SCHEDULE.afternoonHours}, workingDays: [...DEFAULT_SCHEDULE.workingDays]});
    }, [originalSchedule]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const response = await BeverageSalesApiService.updatePosPreferences({
                openingHour: schedule.openingHour,
                closingHour: schedule.closingHour,
                breakHour: schedule.breakHour,
                morningHours: schedule.morningHours,
                afternoonHours: schedule.afternoonHours,
                workingDays: schedule.workingDays,
                open24h: schedule.open24h,
                open7d: schedule.open7d,
            });
            const fresh = response.data?.data;
            if (fresh?.schedule) {
                setSchedule(fresh.schedule);
            }
            await refetch();
            toast.success("Préférences de caisse enregistrées");
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? error?.message ?? "Échec de l'enregistrement.");
        } finally {
            setIsSaving(false);
        }
    }, [schedule, refetch]);

    const todayDay = WEEKDAY_BY_INDEX[new Date().getDay()];
    const today = useMemo(() => dayState(schedule, todayDay), [schedule, todayDay]);

    const openingHint = schedule.open24h
        ? "La caisse reste ouverte en continu les jours travaillés (hors pause)."
        : `La caisse accueille la clientèle de ${schedule.openingHour} à ${schedule.closingHour} les jours travaillés.`;

    return (
        <SettingsLayout.Section>
            <AnimatedContent variant="enter">
            <SettingsLayout.Header
                title={
                    <span className="inline-flex items-center gap-2.5">
                        Préférences de caisse
                        {isDirty && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"/>
                                Non enregistré
                            </span>
                        )}
                    </span>
                }
                description="Définissez les horaires d'ouverture et de fonctionnement de la caisse du dépôt de boissons."
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleReset} disabled={!isDirty || isSaving}>
                            <RotateCcwIcon/>
                            Réinitialiser
                        </Button>
                        <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                            {isSaving ? <WaitingActivity size={16}/> : <SaveIcon/>}
                            Enregistrer
                        </Button>
                    </div>
                }
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <WaitingActivity size={28}/>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 items-start xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="flex flex-col gap-6">
                        <SectionCard
                            icon={<ClockIcon className="size-4"/>}
                            title="Horaires d'ouverture"
                            description="Période pendant laquelle la caisse encaisse les ventes."
                        >
                            <div className="flex items-end justify-center gap-3 py-1">
                                <TimeField
                                    id="opening-hour"
                                    label="Ouverture"
                                    value={schedule.openingHour}
                                    onChange={(v) => updateField('openingHour', v)}
                                    disabled={schedule.open24h}
                                />
                                <ArrowRightIcon className="size-4 text-muted-foreground mb-2"/>
                                <TimeField
                                    id="closing-hour"
                                    label="Fermeture"
                                    value={schedule.closingHour}
                                    onChange={(v) => updateField('closingHour', v)}
                                    disabled={schedule.open24h}
                                />
                            </div>
                            <p className="text-center text-xs text-muted-foreground">
                                {openingHint}
                            </p>
                        </SectionCard>

                        <SectionCard
                            icon={<Settings2Icon className="size-4"/>}
                            title="Créneaux de service"
                            description="Découpage de la journée utilisé par les statistiques de vente."
                        >
                            <div className="flex flex-col gap-3">
                                <TimeRangeRow
                                    icon={<SunIcon className="size-4"/>}
                                    label="Matin"
                                    startValue={schedule.morningHours.start}
                                    endValue={schedule.morningHours.end}
                                    onStartChange={(v) => updateSlot('morningHours', 'start', v)}
                                    onEndChange={(v) => updateSlot('morningHours', 'end', v)}
                                />
                                <TimeRangeRow
                                    icon={<SunsetIcon className="size-4"/>}
                                    label="Après-midi"
                                    startValue={schedule.afternoonHours.start}
                                    endValue={schedule.afternoonHours.end}
                                    onStartChange={(v) => updateSlot('afternoonHours', 'start', v)}
                                    onEndChange={(v) => updateSlot('afternoonHours', 'end', v)}
                                />
                                <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="rounded-lg bg-background p-1.5 text-muted-foreground ring-1 ring-border/60">
                                            <CoffeeIcon className="size-4"/>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Pause</span>
                                            <span className="text-xs text-muted-foreground">
                                                La caisse est fermée pendant ce créneau.
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pl-10 sm:pl-0">
                                        <Input
                                            type="time"
                                            value={schedule.breakHour}
                                            onChange={(e) => updateField('breakHour', e.target.value)}
                                            className="w-28"
                                        />
                                        <Badge variant="secondary" className="shrink-0">60 min</Badge>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard
                            icon={<CalendarDaysIcon className="size-4"/>}
                            title="Jours de travail"
                            description="Les jours où la caisse est active dans la semaine."
                        >
                            <div className={cn("grid grid-cols-4 gap-2 sm:grid-cols-7", schedule.open7d && "pointer-events-none opacity-50")}>
                                {WEEK_DAYS_LABELS.map(day => {
                                    const selected = schedule.workingDays.includes(day.value);
                                    const isToday = day.value === todayDay;
                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleDay(day.value)}
                                            aria-pressed={selected}
                                            className={cn(
                                                "relative flex flex-col items-center gap-1.5 rounded-xl border py-2.5 text-sm transition-all",
                                                selected
                                                    ? "border-primary/60 bg-primary/10 text-primary font-semibold"
                                                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40",
                                                isToday && "ring-2 ring-primary/20"
                                            )}
                                        >
                                            {isToday && (
                                                <span className="absolute top-1 right-1.5 size-1 rounded-full bg-primary"/>
                                            )}
                                            <span className="text-xs">{day.shortLabel}</span>
                                            <span className={cn(
                                                "size-1.5 rounded-full",
                                                selected ? "bg-primary" : "bg-muted-foreground/30"
                                            )}/>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {schedule.open7d
                                    ? "L'ouverture 7j/7 est activée : la sélection des jours est ignorée."
                                    : schedule.workingDays.length === 0
                                        ? "Aucun jour de travail sélectionné."
                                        : `Jours de travail : ${schedule.workingDays
                                            .map(d => WEEK_DAYS_LABELS.find(w => w.value === d)?.label ?? d)
                                            .join(', ')}.`}
                            </p>
                        </SectionCard>

                        <SectionCard
                            icon={<CoffeeIcon className="size-4"/>}
                            title="Options de fonctionnement"
                            description="Raccourcis pour un service en continu ou toute la semaine."
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
                                    <div className="flex flex-col gap-0.5">
                                        <Label htmlFor="open-24h" className="text-sm font-semibold">
                                            Ouverture 24h/24
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            La caisse reste ouverte en continu les jours travaillés, sauf pendant la pause.
                                        </span>
                                    </div>
                                    <Switch
                                        id="open-24h"
                                        checked={schedule.open24h}
                                        onCheckedChange={(v) => updateField('open24h', v)}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
                                    <div className="flex flex-col gap-0.5">
                                        <Label htmlFor="open-7d" className="text-sm font-semibold">
                                            Ouverture 7j/7
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            La caisse travaille tous les jours de la semaine.
                                        </span>
                                    </div>
                                    <Switch
                                        id="open-7d"
                                        checked={schedule.open7d}
                                        onCheckedChange={(v) => updateField('open7d', v)}
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    <div className="flex flex-col gap-6 xl:sticky xl:top-6">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                        <EyeIcon className="size-4"/>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <CardTitle className="text-base font-semibold">Aperçu en direct</CardTitle>
                                        <CardDescription className="text-xs">
                                            Résultat immédiat de vos réglages.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className={cn(
                                    "flex items-center gap-2.5 rounded-xl border p-3",
                                    today.open
                                        ? "border-emerald-500/30 bg-emerald-500/5"
                                        : "border-amber-500/30 bg-amber-500/5"
                                )}>
                                    {today.open
                                        ? <CircleCheckIcon className="size-5 shrink-0 text-emerald-600"/>
                                        : <CircleXIcon className="size-5 shrink-0 text-amber-600"/>}
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            today.open ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                                        )}>
                                            {today.open ? "Caisse ouverte aujourd'hui" : "Caisse fermée aujourd'hui"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{today.label}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                        Semaine
                                    </span>
                                    <div className="grid grid-cols-7 gap-1">
                                        {WEEK_DAYS_LABELS.map(day => {
                                            const state = dayState(schedule, day.value);
                                            const isToday = day.value === todayDay;
                                            return (
                                                <div
                                                    key={day.value}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1 rounded-lg py-1.5",
                                                        isToday && "ring-1 ring-primary/30",
                                                        state.open ? "bg-primary/5 text-foreground" : "text-muted-foreground/60"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "text-[10px] font-semibold uppercase",
                                                        isToday && "text-primary"
                                                    )}>
                                                        {day.shortLabel}
                                                    </span>
                                                    <span className="text-[9px] leading-tight text-center">
                                                        {state.open ? state.label : '—'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {schedule.open24h && (
                                    <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                                        <InfoIcon className="size-3.5 mt-0.5 shrink-0"/>
                                        <span>
                                            Pause quotidienne de 60 min à <strong>{schedule.breakHour}</strong>.
                                            La caisse est fermée pendant ce créneau.
                                        </span>
                                    </div>
                                )}

                                {schedule.open7d && !schedule.open24h && (
                                    <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                                        <InfoIcon className="size-3.5 mt-0.5 shrink-0"/>
                                        <span>
                                            La caisse travaille 7j/7 : les jours de travail et horaires
                                            <strong> {schedule.openingHour} – {schedule.closingHour}</strong> s&apos;appliquent tous les jours.
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            </AnimatedContent>
        </SettingsLayout.Section>
    );
}
