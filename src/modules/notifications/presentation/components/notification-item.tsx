"use client"

import {formatDistanceToNow} from "date-fns";
import {fr} from "date-fns/locale";
import {AlertTriangleIcon, BellRingIcon, CheckIcon, CircleCheckIcon, InfoIcon, MailOpenIcon, ShieldAlertIcon, TimerIcon} from "lucide-react";
import {Badge} from "@/core/presentation/ui/badge";
import {Button} from "@/core/presentation/ui/button";
import {useModal} from "@/core/presentation/modals/hooks/useModal";
import {cn} from "@/core/infrastructure/utilities/utils";
import {NotificationDetailsModal, NotificationDetailsModalProps} from "@/modules/notifications/presentation/components/notification-details.modal";
import {NotificationInterface, NotificationTypeEnum} from "@/modules/notifications/domain/entities/notification.interface";

export interface NotificationItemProps {
    notification: NotificationInterface;
    onRead?: (notification: NotificationInterface) => void;
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

export function NotificationItem({notification, onRead}: NotificationItemProps) {
    const {open, close} = useModal();
    const title = notification.title ?? notification.subject ?? "Notification";
    const body = notification.body ?? notification.message ?? notification.content;
    const isRead = notification.isRead ?? notification.read ?? false;
    const TypeIcon = notificationTypeIcon[(notification.type as NotificationTypeEnum) ?? NotificationTypeEnum.INFORMATION] ?? BellRingIcon;

    const createdAt = notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), {addSuffix: true, locale: fr}) : undefined;

    const openDetails = () => {
        const modalId = open(
            (props: NotificationDetailsModalProps) => (
                <NotificationDetailsModal
                    notification={props.notification}
                    close={() => close(modalId)}
                />
            ),
            {notification, close: () => close(modalId)},
            {
                size: "MD",
                scrollable: true,
                className: "rounded-lg",
            }
        );
    };

    return (
        <div
            onClick={openDetails}
            className={cn(
                "group/notification flex flex-row gap-3 rounded-lg border border-transparent p-2.5 transition-colors cursor-pointer",
                "hover:bg-muted/60 hover:border-foreground/10",
                !isRead && "bg-primary/5 border-primary/10"
            )}
        >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <TypeIcon className="size-4.5"/>
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                        "truncate text-sm font-medium",
                        !isRead && "text-foreground"
                    )}>
                        {title}
                    </p>
                    {!isRead && (
                        <Badge className="shrink-0" variant="default">
                            Nouveau
                        </Badge>
                    )}
                </div>

                {body && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {body}
                    </p>
                )}

                <div className="mt-1.5 flex flex-row items-center gap-2">
                    {notification.type && (
                        <Badge variant="outline" className="h-4 text-[10px]">
                            {notificationTypeLabel[notification.type as NotificationTypeEnum] ?? notification.type}
                        </Badge>
                    )}
                    {createdAt && (
                        <span className="text-[11px] text-muted-foreground">
                            {createdAt}
                        </span>
                    )}
                    {!isRead && onRead && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
                            onClick={(event) => {
                                event.stopPropagation();
                                onRead(notification);
                            }}
                        >
                            <CheckIcon/>
                            Marquer lu
                        </Button>
                    )}
                </div>
            </div>

            {isRead && (
                <MailOpenIcon className="size-4 shrink-0 self-center text-muted-foreground/40"/>
            )}
        </div>
    );
}
