"use client"

import {useQueryClient} from "@tanstack/react-query";
import {BellIcon, InboxIcon} from "lucide-react";
import Link from "next/link";
import {toast} from "sonner";
import {Button} from "@/core/presentation/ui/button";
import {Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger} from "@/core/presentation/ui/popover";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {Skeleton} from "@/core/presentation/ui/skeleton";
import {Badge} from "@/core/presentation/ui/badge";
import {NotificationItem} from "@/modules/notifications/presentation/components/notification-item";
import {useNotifications} from "@/modules/notifications/presentation/hooks/use-notifications";
import {NotificationsApiService} from "@/modules/notifications/application/service/notifications-api-service";
import {NotificationInterface} from "@/modules/notifications/domain/entities/notification.interface";

function NotificationsList({category}: { category: "user" | "organization" }) {
    const {data, isLoading, isError, refetch} = useNotifications(category, {
        limit: 5,
        manualPagination: false,
    });
    const queryClient = useQueryClient();

    const markAsRead = async (notification: NotificationInterface) => {
        try {
            await NotificationsApiService.markAsRead(notification.id);
            await queryClient.invalidateQueries({queryKey: ['notifications']});
        } catch (error: any) {
            toast.error("Impossible de marquer la notification comme lue");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2">
                <Skeleton className="h-12 w-full"/>
                <Skeleton className="h-12 w-full"/>
                <Skeleton className="h-12 w-full"/>
            </div>
        );
    }

    if (isError || data.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                <InboxIcon className="size-8 opacity-40"/>
                <p className="text-xs">Aucune notification</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {data.slice(0, 5).map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                />
            ))}
        </div>
    );
}

export function NotificationsPopover() {
    const {data: userNotifications} = useNotifications("user", {
        limit: 10,
        manualPagination: false,
    });

    const unreadCount = userNotifications.filter((notification) => !(notification.isRead ?? notification.read ?? false)).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="relative w-8 h-8" aria-label="Notifications">
                    <BellIcon/>
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-96 p-0"
                align="end"
                sideOffset={8}
            >
                <PopoverHeader className="px-4 pt-3.5 pb-1">
                    <PopoverTitle>Notifications</PopoverTitle>
                </PopoverHeader>

                <Tabs defaultValue="user">
                    <div className="px-3">
                        <TabsList className="w-full">
                            <TabsTrigger value="user" className="flex-1">
                                Utilisateur
                            </TabsTrigger>
                            <TabsTrigger value="organization" className="flex-1">
                                Organisation
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-2">
                        <TabsContent value="user">
                            <NotificationsList category="user"/>
                        </TabsContent>
                        <TabsContent value="organization">
                            <NotificationsList category="organization"/>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="border-t p-2">
                    <Button asChild variant="ghost" className="w-full justify-center gap-1 text-xs">
                        <Link href="/notifications">
                            Voir toutes les notifications
                        </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
