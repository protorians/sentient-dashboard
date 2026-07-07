import {ProjectManagementService} from "@/modules/project-management/application/service/project-management.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {ProjectsWidget} from "@/modules/project-management/presentation/widgets/projects.widget";

const projectManagementModule: ModuleDeclarationInterface = {
    id: 'project-management',
    key: 'PROJECT_MANAGEMENT',
    name: 'Projet',
    description: 'Gestion des projets',
    icon: "BriefcaseIcon",
    logo: undefined,
    widgets: {
        analytics: ProjectsWidget
    },
    service: {
        fetch: ProjectManagementService
    },
    url: '/project-management',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default projectManagementModule
