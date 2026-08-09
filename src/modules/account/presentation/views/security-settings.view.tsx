"use client"

import React from "react";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";
import {Input} from "@/core/presentation/ui/input";
import {Label} from "@/core/presentation/ui/label";
import {Button} from "@/core/presentation/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";

export function SecuritySettingsView() {
    const [passwords, setPasswords] = React.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setPasswords(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulation de changement de mot de passe
        console.log("Changing password:", passwords);
    };

    return (
        <SettingsLayout.Section>
            <SettingsLayout.Header
                title="Sécurité"
                description="Gérez la sécurité de votre compte et votre mot de passe."
            />
            
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Mot de passe</CardTitle>
                        <CardDescription>
                            Changez votre mot de passe pour sécuriser votre compte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                                <Input 
                                    id="currentPassword" 
                                    name="currentPassword"
                                    type="password"
                                    value={passwords.currentPassword} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                <Input 
                                    id="newPassword" 
                                    name="newPassword"
                                    type="password"
                                    value={passwords.newPassword} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                                <Input 
                                    id="confirmPassword" 
                                    name="confirmPassword"
                                    type="password"
                                    value={passwords.confirmPassword} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Mettre à jour le mot de passe</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout.Section>
    );
}
