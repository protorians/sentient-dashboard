import {OrganizationsService} from "@/modules/organizations/application/service/organizations.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {OrganizationsWidget} from "@/modules/organizations/presentation/widgets/organizations.widget";

const organizationsModule: ModuleDeclarationInterface = {
    id: 'organizations',
    key: 'ORGANIZATIONS',
    name: 'Organisations',
    description: 'Gestion des organisations',
    icon: "BuildingIcon",
    logo: undefined,
    widgets: {
        analytics: OrganizationsWidget
    },
    service: {
        fetch: OrganizationsService
    },
    url: '/organizations',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default organizationsModule
