"use client"

import {useEffect} from "react";
import {toast} from "sonner";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {NotificationsPushService} from "@/modules/notifications/application/service/notifications-push.service";

export function PushNotificationsProvider() {
    const {user} = useAuth();

    useEffect(() => {
        if (!user) {
            NotificationsPushService.stopActivityTracking();
            NotificationsPushService.unsubscribe().catch(() => undefined);
            return;
        }

        const offInApp = NotificationsPushService.onInAppNotification((payload) => {
            toast(payload.title || "Nouvelle notification", {
                description: payload.body || "",
                richColors: true,
            });
        });

        NotificationsPushService.register()
            .then(async () => {
                NotificationsPushService.startActivityTracking();

                if (Notification.permission !== "granted") return;
                const subscription = await NotificationsPushService.getSubscription();
                if (!subscription) await NotificationsPushService.subscribe();
            })
            .catch((error) => console.error("Push notifications initialization failed", error));

        return () => {
            offInApp();
            NotificationsPushService.stopActivityTracking();
        };
    }, [user]);

    return null;
}
