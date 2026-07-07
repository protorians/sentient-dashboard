import {CrmService} from "@/modules/crm/application/service/crm.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {CrmWidget} from "@/modules/crm/presentation/widgets/crm.widget";

const crmModule: ModuleDeclarationInterface = {
    id: 'crm',
    key: 'CRM',
    name: 'CRM',
    description: 'Gestion de la relation client',
    icon: "ContactIcon",
    logo: undefined,
    widgets: {
        analytics: CrmWidget
    },
    service: {
        fetch: CrmService
    },
    url: '/crm',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default crmModule
