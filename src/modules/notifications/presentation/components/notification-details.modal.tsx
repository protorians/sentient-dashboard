"use client"

import {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {AlertTriangleIcon, BellRingIcon, CheckIcon, CircleCheckIcon, InfoIcon, MailOpenIcon, ShieldAlertIcon, TimerIcon} from "lucide-react";
import {toast} from "sonner";
import {Badge} from "@/core/presentation/ui/badge";
import {Button} from "@/core/presentation/ui/button";
import {Separator} from "@/core/presentation/ui/separator";
import {NotificationsApiService} from "@/modules/notifications/application/service/notifications-api-service";
import {NotificationInterface, NotificationTypeEnum} from "@/modules/notifications/domain/entities/notification.interface";

export interface NotificationDetailsModalProps {
    notification: NotificationInterface;
    close?: () => void;
}

const notificationTypeIcon = {
    [NotificationTypeEnum.ALERT]: AlertTriangleIcon,
    [NotificationTypeEnum.INFORMATION]: InfoIcon,
    [NotificationTypeEnum.CONFIRMATION]: CircleCheckIcon,
    [NotificationTypeEnum.REMINDER]: TimerIcon,
    [NotificationTypeEnum.SECURITY]: ShieldAlertIcon,
};

const notificationTypeLabel = {
    [NotificationTypeEnum.ALERT]: "Alerte",
    [NotificationTypeEnum.INFORMATION]: "Information",
    [NotificationTypeEnum.CONFIRMATION]: "Confirmation",
    [NotificationTypeEnum.REMINDER]: "Rappel",
    [NotificationTypeEnum.SECURITY]: "Sécurité",
};

const notificationTypeVariant = {
    [NotificationTypeEnum.ALERT]: "destructive" as const,
    [NotificationTypeEnum.INFORMATION]: "secondary" as const,
    [NotificationTypeEnum.CONFIRMATION]: "default" as const,
    [NotificationTypeEnum.REMINDER]: "outline" as const,
    [NotificationTypeEnum.SECURITY]: "destructive" as const,
};

function formatDateTime(date?: string | null): string {
    if (!date) return "Non renseigné";
    try {
        return format(new Date(date), "d MMMM yyyy 'à' HH:mm", {locale: fr});
    } catch {
        return "Date invalide";
    }
}

export function NotificationDetailsModal({notification, close}: NotificationDetailsModalProps) {
    const queryClient = useQueryClient();
    const [isRead, setIsRead] = useState(notification.isRead ?? notification.read ?? false);

    const title = notification.title ?? notification.subject ?? "Notification";
    const body = notification.body ?? notification.message ?? notification.content ?? "Aucun contenu";
    const TypeIcon = notificationTypeIcon[(notification.type as NotificationTypeEnum) ?? NotificationTypeEnum.INFORMATION] ?? BellRingIcon;

    const markAsRead = async () => {
        try {
            await NotificationsApiService.markAsRead(notification.id);
            setIsRead(true);
            await queryClient.invalidateQueries({queryKey: ['notifications']});
        } catch (error: any) {
            toast.error("Impossible de marquer la notification comme lue");
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-start gap-3 p-4 pb-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <TypeIcon className="size-5.5"/>
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold leading-snug break-words">
                        {title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {notification.type && (
                            <Badge variant={notificationTypeVariant[(notification.type as NotificationTypeEnum) ?? NotificationTypeEnum.INFORMATION]}>
                                {notificationTypeLabel[(notification.type as NotificationTypeEnum) ?? NotificationTypeEnum.INFORMATION]}
                            </Badge>
                        )}
                        {isRead ? (
                            <Badge variant="secondary" className="gap-1">
                                <MailOpenIcon/>
                                Lue
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="gap-1">
                                Nouvelle
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <Separator/>

            <div className="p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
                    {body}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailField label="Reçue le" value={formatDateTime(notification.createdAt)}/>
                    <DetailField label="Lue le" value={formatDateTime(notification.readAt ?? (isRead ? notification.updatedAt : null))}/>
                    <DetailField label="Organisation" value={notification.organizationId ?? "—"}/>
                    <DetailField label="ID" value={notification.id}/>
                </div>
            </div>

            <Separator/>

            <div className="flex items-center justify-end gap-2 p-3">
                {!isRead && (
                    <Button variant="outline" className="gap-1.5" onClick={markAsRead}>
                        <CheckIcon/>
                        Marquer comme lue
                    </Button>
                )}
                <Button variant="default" onClick={close}>
                    Fermer
                </Button>
            </div>
        </div>
    );
}

function DetailField({label, value}: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 px-3 py-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                {label}
            </span>
            <span className="text-sm font-medium break-words">
                {value}
            </span>
        </div>
    );
}
