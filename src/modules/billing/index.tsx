import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {BillingWidget} from "@/modules/billing/presentation/widgets/billing.widget";

const billingModule: ModuleDeclarationInterface = {
    id: 'billing',
    key: 'BILLING',
    name: 'Facturations',
    description: 'Gestion des factures et paiements',
    icon: "CreditCardIcon",
    logo: undefined,
    widgets: {
        analytics: BillingWidget
    },
    service: {
        fetch: BillingApiService
    },
    url: '/billing',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default billingModule
