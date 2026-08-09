"use client"

import React from "react";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";
import {Input} from "@/core/presentation/ui/input";
import {Label} from "@/core/presentation/ui/label";
import {Button} from "@/core/presentation/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/core/presentation/ui/avatar";

export function AccountSettingsView() {
    const {user} = useAuth();
    
    const [formData, setFormData] = React.useState({
        firstname: user?.userData?.firstname || "",
        lastname: user?.userData?.lastname || "",
        email: user?.email || "",
        username: user?.username || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Pour l'instant, on simule une sauvegarde car l'implémentation de la mutation n'est pas demandée explicitement
        console.log("Saving user data:", formData);
    };

    return (
        <SettingsLayout.Section>
            <SettingsLayout.Header
                title="Mon compte"
                description="Gérez vos informations personnelles et les paramètres de votre compte."
            />
            
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil</CardTitle>
                        <CardDescription>
                            Ces informations seront affichées sur votre profil.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="/avatars/shadcn.jpg" alt={user?.username} />
                                    <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" type="button">Changer l'avatar</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstname">Prénom</Label>
                                    <Input 
                                        id="firstname" 
                                        name="firstname"
                                        value={formData.firstname} 
                                        onChange={handleChange}
                                        placeholder="Votre prénom" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Nom</Label>
                                    <Input 
                                        id="lastname" 
                                        name="lastname"
                                        value={formData.lastname} 
                                        onChange={handleChange}
                                        placeholder="Votre nom" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Nom d'utilisateur</Label>
                                    <Input 
                                        id="username" 
                                        name="username"
                                        value={formData.username} 
                                        onChange={handleChange}
                                        placeholder="Nom d'utilisateur" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        name="email"
                                        type="email"
                                        value={formData.email} 
                                        onChange={handleChange}
                                        placeholder="votre@email.com" 
                                        disabled
                                    />
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        L'adresse email ne peut pas être modifiée ici.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <Button type="submit">Enregistrer les modifications</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout.Section>
    );
}
