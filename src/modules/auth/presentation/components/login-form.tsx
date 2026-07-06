"use client"

import {cn} from "@/core/infrastructure/utilities/utils"
import {Button} from "@/core/presentation/ui/button"
import {FieldGroup} from "@/core/presentation/ui/field"
import {NestedInput} from "@/core/presentation/ui/nested-input"
import {Mail, Eye, EyeOff} from "lucide-react"
import Link from "next/link"
import {useState} from "react"
import {SignInDataset} from "@/modules/auth/infrastructure/dataset/sign-in.dataset"
import {motion} from "framer-motion"
import {AuthService} from "@/modules/auth/application/service/auth.service";

export function LoginForm({className, ...props}: React.ComponentProps<"form">) {
    const {setter, getter, dataset, consolidate} = SignInDataset()
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // consolidate() validates and will toast + throw if invalid
            const data = consolidate();

            const response = await AuthService.signIn({
                username: data.email!,
                password: data.password!,
            })

            console.log('AuthSessionService', response.data)
        } catch (error) {
            // consolidate throws on invalid dataset; keep logging
            console.error('Login Error', error)
        }
    }

    return (
        <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 20}}
            transition={{duration: 0.3}}
            className={cn("flex flex-col gap-6 w-full", className)}>
            <form onSubmit={handleSubmit} {...props}>
                <FieldGroup className="gap-4">
                    <div className="flex flex-col gap-1 text-left w-full mb-4">
                        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Bon retour</span>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Se connecter<span className="text-primary">.</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Vous n'avez pas de compte?{" "}
                            <Link href="/auth/sign-up" className="text-primary hover:underline font-semibold">
                                S'inscrire
                            </Link>
                        </p>
                    </div>

                    <NestedInput
                        id="email"
                        label="Email"
                        input={{
                            type: "email",
                            placeholder: "email@example.com",
                            required: true,
                            value: getter('email') || '',
                            onChange: e => setter('email', e.target.value),

                        }}
                        icon={<Mail className="size-4 text-muted-foreground/60"/>}
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

                    <div className="flex items-center gap-4 w-full mt-4">
                        {/*<Button*/}
                        {/*    type="button"*/}
                        {/*    variant="outline"*/}
                        {/*    className="flex-1 rounded-full border-none text-muted-foreground hover:text-white transition-all py-5 cursor-pointer"*/}
                        {/*    onClick={() => window.location.href = "/auth/sign-up"}*/}
                        {/*>*/}
                        {/*    S'inscrire*/}
                        {/*</Button>*/}
                        <Button
                            type="submit"
                            className="flex-1 rounded-full text-white font-bold border-none transition-all py-5 shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            Se connecter
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
