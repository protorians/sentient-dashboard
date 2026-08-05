"use client"

export interface ActivityState {
    active: boolean;
    lastActivityAt: number;
}

export interface ActivityTrackerOptions {
    inactivityTimeout?: number;
    onStateChange?: (state: ActivityState) => void;
}

export class ActivityTrackerService {

    protected static inactivityTimeout = 60000;
    protected static trackingStarted = false;
    protected static active = false;
    protected static lastActivityTimestamp = 0;
    protected static onStateChange: ((state: ActivityState) => void) | undefined;

    protected static activityHandler = (): void => undefined;
    protected static blurHandler = (): void => undefined;
    protected static stateSyncInterval: ReturnType<typeof setInterval> | undefined;

    static get isSupported(): boolean {
        return typeof window !== "undefined";
    }

    static get isActive(): boolean {
        return this.active;
    }

    static get isInactive(): boolean {
        return !this.active;
    }

    static get lastActivityAt(): number {
        return this.lastActivityTimestamp;
    }

    static get state(): ActivityState {
        return {active: this.active, lastActivityAt: this.lastActivityTimestamp};
    }

    static start(options?: ActivityTrackerOptions): void {
        if (!this.isSupported || this.trackingStarted) return;

        this.trackingStarted = true;
        this.active = true;
        this.lastActivityTimestamp = Date.now();
        this.inactivityTimeout = options?.inactivityTimeout ?? 60000;
        this.onStateChange = options?.onStateChange;

        this.activityHandler = () => {
            this.lastActivityTimestamp = Date.now();
            if (!this.active) {
                this.active = true;
                this.emitStateChange();
            }
        };

        this.blurHandler = () => {
            if (this.active) {
                this.active = false;
                this.emitStateChange();
            }
        };

        window.addEventListener("mousemove", this.activityHandler, {passive: true});
        window.addEventListener("mousedown", this.activityHandler, {passive: true});
        window.addEventListener("keydown", this.activityHandler, {passive: true});
        window.addEventListener("scroll", this.activityHandler, {passive: true});
        window.addEventListener("touchstart", this.activityHandler, {passive: true});
        window.addEventListener("focus", this.activityHandler);
        window.addEventListener("blur", this.blurHandler);

        this.stateSyncInterval = setInterval(() => {
            const isInactive = Date.now() - this.lastActivityTimestamp >= this.inactivityTimeout;
            if (isInactive && this.active) {
                this.active = false;
                this.emitStateChange();
            }
        }, 15000);
    }

    static stop(): void {
        if (!this.trackingStarted) return;

        this.trackingStarted = false;
        if (this.stateSyncInterval) clearInterval(this.stateSyncInterval);
        this.stateSyncInterval = undefined;

        window.removeEventListener("mousemove", this.activityHandler);
        window.removeEventListener("mousedown", this.activityHandler);
        window.removeEventListener("keydown", this.activityHandler);
        window.removeEventListener("scroll", this.activityHandler);
        window.removeEventListener("touchstart", this.activityHandler);
        window.removeEventListener("focus", this.activityHandler);
        window.removeEventListener("blur", this.blurHandler);

        this.onStateChange = undefined;
    }

    protected static emitStateChange(): void {
        this.onStateChange?.(this.state);
    }

}
