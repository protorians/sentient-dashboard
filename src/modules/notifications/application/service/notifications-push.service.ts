"use client"

import {AppConfig} from "@/core/domain/config/app.config";
import {ActivityTrackerService} from "@/core/infrastructure/utilities/activity-tracker.service";
import {NotificationsApiService} from "@/modules/notifications/application/service/notifications-api-service";
import {NotificationsSocketService} from "@/modules/notifications/application/service/notifications-socket-service";

export class NotificationsPushService {

    protected static swPath = "/sw.js";
    protected static trackingStarted = false;
    protected static visibilityHandler = (): void => undefined;

    static get isSupported(): boolean {
        return typeof window !== "undefined"
            && "serviceWorker" in navigator
            && "PushManager" in window
            && "Notification" in window;
    }

    static async register(): Promise<ServiceWorkerRegistration | undefined> {
        if (!this.isSupported) return undefined;
        return navigator.serviceWorker.register(this.swPath, {
            scope: "/",
            updateViaCache: "none",
        });
    }

    static async getSubscription(): Promise<PushSubscription | null> {
        if (!this.isSupported) return null;
        const registration = await navigator.serviceWorker.ready;
        return registration.pushManager.getSubscription();
    }

    static async subscribe(): Promise<PushSubscription | null> {
        if (!this.isSupported) return null;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return null;

        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) return existing;

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(AppConfig.VAPID_PUBLIC_KEY),
        });

        await this.saveSubscription(subscription);

        return subscription;
    }

    static async unsubscribe(): Promise<boolean> {
        const subscription = await this.getSubscription();
        if (!subscription) return false;

        await this.removeSubscription(subscription);

        return subscription.unsubscribe();
    }

    static async connect(): Promise<void> {
        NotificationsSocketService.connectNotifications();
    }

    static async getNotifications<T = any>(page = 1, limit = 10): Promise<T> {
        return NotificationsSocketService.getUserNotifications<T>(page, limit);
    }

    static async getOrganizationNotifications<T = any>(organizationId?: string, page = 1, limit = 10): Promise<T> {
        return NotificationsSocketService.getOrganizationNotifications<T>(organizationId, page, limit);
    }

    static get clientState() {
        return {
            active: ActivityTrackerService.isActive,
            visible: document.visibilityState === "visible",
            focused: document.hasFocus(),
        };
    }

    static startActivityTracking(): void {
        if (!this.isSupported || this.trackingStarted) return;

        this.trackingStarted = true;
        this.visibilityHandler = () => this.syncClientState();

        ActivityTrackerService.start({onStateChange: () => this.syncClientState()});
        document.addEventListener("visibilitychange", this.visibilityHandler);

        this.syncClientState();
    }

    static stopActivityTracking(): void {
        if (!this.trackingStarted) return;

        this.trackingStarted = false;
        document.removeEventListener("visibilitychange", this.visibilityHandler);

        ActivityTrackerService.stop();
    }

    static onInAppNotification(callback: (payload: any) => void): () => void {
        const handler = (event: MessageEvent) => {
            if (event.data && event.data.type === "NOTIFICATION_RECEIVED") {
                callback(event.data.payload);
            }
        };

        navigator.serviceWorker.addEventListener("message", handler);

        return () => navigator.serviceWorker.removeEventListener("message", handler);
    }

    protected static syncClientState(): void {
        const controller = navigator.serviceWorker.controller;
        if (!controller) return;
        controller.postMessage({type: "CLIENT_STATE", ...this.clientState});
    }

    protected static async saveSubscription(subscription: PushSubscription): Promise<void> {
        const payload = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: this.toBase64Url(subscription.getKey("p256dh")),
                auth: this.toBase64Url(subscription.getKey("auth")),
            },
        };

        try {
            await NotificationsApiService.savePushSubscription(payload);
        } catch (error) {
            console.error("Push subscription could not be saved", error);
        }
    }

    protected static async removeSubscription(subscription: PushSubscription): Promise<void> {
        try {
            await NotificationsApiService.removePushSubscription(subscription.endpoint);
        } catch (error) {
            console.error("Push subscription could not be removed", error);
        }
    }

    protected static urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    protected static toBase64Url(buffer: ArrayBuffer | null): string {
        if (!buffer) return "";

        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; ++i) {
            binary += String.fromCharCode(bytes[i]);
        }

        return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

}
