"use client"

import {cn} from "@/core/infrastructure/utilities/utils"
import {Button} from "@/core/presentation/ui/button"
import {FieldGroup} from "@/core/presentation/ui/field"
import {NestedInput} from "@/core/presentation/ui/nested-input"
import {NestedPhoneInput} from "@/core/presentation/ui/nested-phone-input"
import {User, Mail, Eye, EyeOff, Building} from "lucide-react"
import Link from "next/link"
import {useEffect, useState} from "react"
import {SignUpDataset} from "@/modules/auth/infrastructure/dataset/sign-up.dataset"
import {motion} from "framer-motion"
import {AuthService} from "@/modules/auth/application/service/auth.service";

import { toast } from "sonner";

export function RegisterForm({className, ...props}: React.ComponentProps<"form">) {
    const {setter, getter, consolidate} = SignUpDataset()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            // consolidate validates and will toast + throw if invalid
            const data = consolidate();

            // check password confirmation match
            if (data.password !== data.password_confirmation) {
                toast.error('Les mots de passe ne correspondent pas');
                return;
            }

            const response = await AuthService.signUp({
                first_names: data.first_names!,
                last_name: data.last_name!,
                organization: data.organization!,
                email: data.email!,
                password: data.password!,
                password_confirmation: data.password_confirmation!,
            })

            console.log('AuthSessionService', response.data)
        } catch (error) {
            console.error('Login Error', error)
        }
    }

    return (
        <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.3}}
            className={cn("flex flex-col gap-6 w-full", className)}>
            <form onSubmit={handleSubmit} {...props}>
                <FieldGroup className="gap-4">
                    <div className="flex flex-col gap-1 text-left w-full mb-4">
                        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Commencez gratuitement</span>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Créer un compte<span className="text-primary">.</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Déjà membre ?{" "}
                            <Link href="/auth/sign-in" className="text-primary hover:underline font-semibold">
                                Se connecter
                            </Link>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <NestedInput
                            id="first_names"
                            label="Prénom(s)"
                            input={{
                                type: "text",
                                placeholder: "Ex: John",
                                required: true,
                                value: getter('first_names') || '',
                                onChange: e => setter('first_names', e.target.value)
                            }}
                            icon={<User className="size-4 text-muted-foreground/60"/>}
                        />
                        <NestedInput
                            id="last_name"
                            label="Nom de famille"
                            input={{
                                type: "text",
                                placeholder: "Ex: Doe",
                                required: true,
                                value: getter('last_name') || '',
                                onChange: e => setter('last_name', e.target.value)
                            }}
                            icon={<User className="size-4 text-muted-foreground/60"/>}
                        />
                    </div>

                    <NestedInput
                        id="organization"
                        label="organization"
                        input={{
                            type: "text",
                            placeholder: "Ex: Ma Société",
                            required: true,
                            value: getter('organization') || '',
                            onChange: e => setter('organization', e.target.value)
                        }}
                        icon={<Building className="size-4 text-muted-foreground/60"/>}
                    />

                    <NestedInput
                        id="email"
                        label="Email"
                        input={{
                            type: "email",
                            placeholder: "email@example.com",
                            required: true,
                            value: getter('email') || '',
                            onChange: e => setter('email', e.target.value)
                        }}
                        icon={<Mail className="size-4 text-muted-foreground/60"/>}
                    />

                    <NestedPhoneInput
                        id="phone"
                        label="Numéro de téléphone"
                        value={getter('phone') || ''}
                        onChange={value => setter('phone', value)}
                        input={{
                            placeholder: "6 12 34 56 78",
                            required: true,
                        }}
                    />

                    <NestedInput
                        id="password"
                        label="Mot de passe"
                        input={{
                            type: showPassword ? "text" : "password",
                            placeholder: "••••••••",
                            required: true,
                            value: getter('password') || '',
                            onChange: e => setter('password', e.target.value),
                        }}
                        icon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-muted-foreground/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                            >
                                {showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                            </button>
                        }
                    />

                    <NestedInput
                        id="password_confirmation"
                        label="Confirmation du mot de passe"
                        input={{
                            type: showConfirmPassword ? "text" : "password",
                            placeholder: "••••••••",
                            required: true,
                            value: getter('password_confirmation') || '',
                            onChange: e => setter('password_confirmation', e.target.value)
                        }}
                        icon={
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-muted-foreground/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                            >
                                {showConfirmPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                            </button>
                        }
                    />

                    <div className="flex items-center gap-4 w-full mt-4">
                        {/*<Button*/}
                        {/*    type="button"*/}
                        {/*    variant="outline"*/}
                        {/*    className="flex-1 rounded-full  border-none text-muted-foreground hover:text-white transition-all py-5 cursor-pointer"*/}
                        {/*    onClick={() => window.location.href = "/auth/sign-in"}*/}
                        {/*>*/}
                        {/*    Se connecter*/}
                        {/*</Button>*/}
                        <Button
                            type="submit"
                            className="flex-1 rounded-full text-white font-bold border-none transition-all py-5 shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            Créer un compte
                        </Button>
                    </div>
                </FieldGroup>
            </form>
            <p className="px-2 text-left text-[11px] text-muted-foreground/50 leading-relaxed">
                En continuant la navigation, vous acceptez nos <Link href="#" className="underline hover:text-white">Conditions
                Générales d'utilisation</Link> et notre <Link href="#" className="underline hover:text-white">Politique
                de confidentialité</Link>.
            </p>
        </motion.div>
    )
}
