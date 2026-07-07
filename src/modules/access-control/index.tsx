import {AccessControlService} from "@/modules/access-control/application/service/access-control.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {AccessControlWidget} from "@/modules/access-control/presentation/widgets/access-control.widget";

const accessControlModule: ModuleDeclarationInterface = {
    id: 'access-control',
    key: 'ACCESS_CONTROL',
    name: "Contrôle d'accès",
    description: "Gestion des permissions et rôles",
    icon: "ShieldIcon",
    logo: undefined,
    widgets: {
        analytics: AccessControlWidget
    },
    service: {
        fetch: AccessControlService
    },
    url: '/access-control',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default accessControlModule
