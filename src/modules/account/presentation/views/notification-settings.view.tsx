"use client"

import React from "react";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";
import {Label} from "@/core/presentation/ui/label";
import {Switch} from "@/core/presentation/ui/switch";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";

export function NotificationSettingsView() {
    return (
        <SettingsLayout.Section>
            <SettingsLayout.Header
                title="Notifications"
                description="Gérez comment vous recevez les notifications."
            />
            
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications par email</CardTitle>
                        <CardDescription>
                            Choisissez les emails que vous souhaitez recevoir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="email-notifications">Emails de sécurité</Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez des alertes sur l'activité de votre compte.
                                </p>
                            </div>
                            <Switch id="email-notifications" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="marketing-emails">Emails marketing</Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez des offres et des nouveautés.
                                </p>
                            </div>
                            <Switch id="marketing-emails" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifications Push</CardTitle>
                        <CardDescription>
                            Gérez les notifications sur votre navigateur.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="push-notifications">Activer les notifications push</Label>
                                <p className="text-sm text-muted-foreground">
                                    Recevez des notifications en temps réel.
                                </p>
                            </div>
                            <Switch id="push-notifications" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout.Section>
    );
}
