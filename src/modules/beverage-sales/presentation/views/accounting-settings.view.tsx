"use client"

import React, {useCallback, useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {AccountingApiService} from "@/modules/accounting/application/service/accounting-api-service";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {PosRequiredAccountsInterface} from "@/modules/beverage-sales/domain/pos-required-accounts.interface";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";
import {AnimatedContent} from "@/core/presentation/animated-content";
import {Button} from "@/core/presentation/ui/button";
import {Badge} from "@/core/presentation/ui/badge";
import {Label} from "@/core/presentation/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {Alert, AlertDescription, AlertTitle} from "@/core/presentation/ui/alert";
import {SaveIcon, WandSparklesIcon, AlertTriangleIcon, CheckCircle2Icon, XCircleIcon} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {toast} from "sonner";

interface Account {
    id: string;
    code: string;
    label: string;
    type: string;
}

interface AccountingSettings {
    defaultReceivableAccountId: string | null;
    defaultRevenueAccountId: string | null;
    defaultTaxAccountId: string | null;
    defaultBankAccountId: string | null;
    defaultFeeAccountId: string | null;
}

export default function AccountingSettingsView() {
    const [receivableAccountId, setReceivableAccountId] = useState<string>("");
    const [revenueAccountId, setRevenueAccountId] = useState<string>("");
    const [taxAccountId, setTaxAccountId] = useState<string>("");
    const [bankAccountId, setBankAccountId] = useState<string>("");
    const [feeAccountId, setFeeAccountId] = useState<string>("");
    const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);

    const {data: accounts, isLoading: isLoadingAccounts, refetch: refetchAccounts} = useQuery<Account[]>({
        queryKey: ['accounting', 'accounts'],
        queryFn: async () => {
            const response = await AccountingApiService.getAccounts();
            return response.data?.data ?? [];
        }
    });

    const {data: settings, isLoading: isLoadingSettings, refetch: refetchSettings} = useQuery<AccountingSettings>({
        queryKey: ['accounting', 'settings'],
        queryFn: async () => {
            const response = await AccountingApiService.getSettings();
            return response.data?.data ?? {};
        }
    });

    const {data: requiredAccounts, isLoading: isLoadingRequiredAccounts, refetch: refetchRequiredAccounts} =
        useQuery<PosRequiredAccountsInterface>({
            queryKey: ['pos', 'required-accounts'],
            queryFn: async () => {
                const response = await BeverageSalesApiService.getRequiredAccounts();
                return response.data?.data ?? {accounts: [], allConfigured: false};
            }
        });

    useEffect(() => {
        if (!settings) return;
        setReceivableAccountId(settings.defaultReceivableAccountId ?? "");
        setRevenueAccountId(settings.defaultRevenueAccountId ?? "");
        setTaxAccountId(settings.defaultTaxAccountId ?? "");
        setBankAccountId(settings.defaultBankAccountId ?? "");
        setFeeAccountId(settings.defaultFeeAccountId ?? "");
    }, [settings]);

    const isLoading = isLoadingAccounts || isLoadingSettings || isLoadingRequiredAccounts;

    const allConfigured = requiredAccounts?.allConfigured ?? false;

    const handleAutoConfigure = useCallback(async () => {
        setIsAutoConfiguring(true);
        try {
            const response = await BeverageSalesApiService.autoConfigureAccounts();
            const result = response.data?.data;

            const created = result?.createdAccounts ?? [];
            const existing = result?.existingAccounts ?? [];
            const updated = result?.updatedSettings ?? [];

            const parts: string[] = [];
            if (created.length > 0) parts.push(`${created.length} compte(s) créé(s)`);
            if (existing.length > 0) parts.push(`${existing.length} compte(s) existant(s)`);
            if (updated.length > 0) parts.push(`${updated.length} paramètre(s) configuré(s)`);

            if (result?.settingsUpdated) {
                toast.success(parts.join(", "));
            } else if (existing.length > 0) {
                toast.info(`Tous les comptes existent déjà (${existing.join(", ")}). Les paramètres comptables sont à jour.`);
            }

            await refetchAccounts();
            await refetchRequiredAccounts();
            const {data: freshSettings} = await refetchSettings();

            if (freshSettings) {
                setReceivableAccountId(freshSettings.defaultReceivableAccountId ?? "");
                setRevenueAccountId(freshSettings.defaultRevenueAccountId ?? "");
                setTaxAccountId(freshSettings.defaultTaxAccountId ?? "");
                setBankAccountId(freshSettings.defaultBankAccountId ?? "");
                setFeeAccountId(freshSettings.defaultFeeAccountId ?? "");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? error?.message ?? "Échec de l'auto-configuration.");
        } finally {
            setIsAutoConfiguring(false);
        }
    }, [refetchAccounts, refetchRequiredAccounts, refetchSettings]);

    const handleSave = useCallback(async () => {
        try {
            await AccountingApiService.updateSettings({
                defaultReceivableAccountId: receivableAccountId || null,
                defaultRevenueAccountId: revenueAccountId || null,
                defaultTaxAccountId: taxAccountId || null,
                defaultBankAccountId: bankAccountId || null,
                defaultFeeAccountId: feeAccountId || null,
            });
            const {data: freshSettings} = await refetchSettings();
            if (freshSettings) {
                setReceivableAccountId(freshSettings.defaultReceivableAccountId ?? "");
                setRevenueAccountId(freshSettings.defaultRevenueAccountId ?? "");
                setTaxAccountId(freshSettings.defaultTaxAccountId ?? "");
                setBankAccountId(freshSettings.defaultBankAccountId ?? "");
                setFeeAccountId(freshSettings.defaultFeeAccountId ?? "");
            }
            toast.success("Paramètres comptables enregistrés");
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? error?.message ?? "Échec de l'enregistrement.");
        }
    }, [receivableAccountId, revenueAccountId, taxAccountId, bankAccountId, feeAccountId, refetchSettings]);

    const unassignedLabel = "— Non défini —";

    const renderAccountSelect = (
        id: string,
        label: string,
        description: string,
        value: string,
        onChange: (v: string) => void,
        accountType: string,
        required?: boolean,
    ) => {
        const allAccounts = accounts ?? [];
        const options = allAccounts.filter(a => a.type === accountType);
        const selectedAccount = allAccounts.find(a => a.id === value);
        return (
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={id}>
                    {label}{required ? " *" : ""}
                </Label>
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger id={id} className="w-full">
                        <SelectValue placeholder={unassignedLabel}>
                            {selectedAccount ? `${selectedAccount.code} — ${selectedAccount.label}` : unassignedLabel}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">{unassignedLabel}</SelectItem>
                        {options.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.code} — {account.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {description && (
                    <span className="text-xs text-muted-foreground">{description}</span>
                )}
            </div>
        );
    };

    return (
        <SettingsLayout.Section>
            <AnimatedContent variant="enter">
            <SettingsLayout.Header
                title="Paramètres comptables"
                description="Configurez les comptes comptables par défaut pour la facturation automatique."
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <WaitingActivity size={28}/>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <CardTitle>Comptes par défaut</CardTitle>
                                <CardDescription>
                                    Comptes requis pour la facturation automatique (voir{" "}
                                    <a href="/docs/modules/billing" className="underline" target="_blank">
                                        documentation
                                    </a>
                                    ). L&apos;auto-configuration crée les comptes manquants et les
                                    enregistre comme valeurs par défaut.
                                </CardDescription>
                            </div>
                            {!allConfigured && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleAutoConfigure}
                                    disabled={isAutoConfiguring}
                                >
                                    {isAutoConfiguring ? (
                                        <WaitingActivity size={16}/>
                                    ) : (
                                        <WandSparklesIcon/>
                                    )}
                                    Auto-configurer
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-6">
                        {!allConfigured && (
                            <Alert className="border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                                <AlertTriangleIcon className="text-amber-600 dark:text-amber-400"/>
                                <AlertTitle>Comptes non configurés</AlertTitle>
                                <AlertDescription>
                                    {requiredAccounts?.accounts?.length > 0
                                        ? "Les comptes comptables requis pour le module POS ne sont pas tous configurés :"
                                        : "Aucun compte comptable n&apos;a encore été défini. Cliquez sur <strong>Auto-configurer</strong> pour créer les comptes requis (411 Clients, 701 Ventes de marchandises, 443 TVA collectée, 521 Banque, 655 Frais bancaires) et les enregistrer dans les paramètres comptables."}
                                </AlertDescription>
                            </Alert>
                        )}

                        {(requiredAccounts?.accounts?.length ?? 0) > 0 && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">État des comptes requis</h4>
                                    {allConfigured && (
                                        <Badge className="gap-1 bg-green-500/10 text-green-600 border-none">
                                            <CheckCircle2Icon className="size-3"/>
                                            Tout est configuré
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {requiredAccounts?.accounts.map(account => (
                                        <div
                                            key={account.code}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-border/40 px-3 py-2"
                                        >
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="text-sm font-semibold">
                                                    {account.code} — {account.label}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {account.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "gap-1 text-[10px] rounded-full border-none",
                                                        account.exists
                                                            ? "bg-green-500/10 text-green-600"
                                                            : "bg-red-500/10 text-red-500"
                                                    )}
                                                >
                                                    {account.exists ? <CheckCircle2Icon className="size-3"/> : <XCircleIcon className="size-3"/>}
                                                    {account.exists ? "Existe" : "Manquant"}
                                                </Badge>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "gap-1 text-[10px] rounded-full border-none",
                                                        account.isConfigured
                                                            ? "bg-green-500/10 text-green-600"
                                                            : "bg-amber-500/10 text-amber-600"
                                                    )}
                                                >
                                                    {account.isConfigured ? <CheckCircle2Icon className="size-3"/> : <XCircleIcon className="size-3"/>}
                                                    {account.isConfigured ? "Configuré" : "Non configuré"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {renderAccountSelect(
                            "receivable-account",
                            "Compte clients (créances)",
                            "Type ACTIF — ex. 411 Clients. Débit clients lors de l'écriture de vente.",
                            receivableAccountId,
                            setReceivableAccountId,
                            "ASSET",
                            true,
                        )}

                        {renderAccountSelect(
                            "revenue-account",
                            "Compte produits",
                            "Type PRODUIT — ex. 701 Ventes de marchandises. Crédit produits lors de l'écriture de vente.",
                            revenueAccountId,
                            setRevenueAccountId,
                            "REVENUE",
                            true,
                        )}

                        {renderAccountSelect(
                            "tax-account",
                            "Compte TVA collectée",
                            "Type PASSIF — ex. 443 ou 4457. Crédit TVA lors de l'écriture de vente (optionnel).",
                            taxAccountId,
                            setTaxAccountId,
                            "LIABILITY",
                        )}

                        {renderAccountSelect(
                            "bank-account",
                            "Compte banque",
                            "Type ACTIF — ex. 521 Banque. Débit banque lors de l'écriture de paiement. Sinon auto-détecté via un compte bancaire relié.",
                            bankAccountId,
                            setBankAccountId,
                            "ASSET",
                        )}

                        {renderAccountSelect(
                            "fee-account",
                            "Compte de frais de transaction",
                            "Type CHARGE — ex. 655 Frais bancaires. Requis si une méthode de paiement avec frais est utilisée. Sinon auto-détecté (premier compte 6..).",
                            feeAccountId,
                            setFeeAccountId,
                            "EXPENSE",
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={isAutoConfiguring}
                            >
                                <SaveIcon/>
                                Enregistrer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            </AnimatedContent>
        </SettingsLayout.Section>
    );
}
