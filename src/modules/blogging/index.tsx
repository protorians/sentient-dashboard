import {BloggingService} from "@/modules/blogging/application/service/blogging.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {BloggingWidget} from "@/modules/blogging/presentation/widgets/blogging.widget";

const bloggingModule: ModuleDeclarationInterface = {
    id: 'blog',
    key: 'BLOG',
    name: 'Blog',
    description: 'Gestion du contenu du blog',
    icon: "FileTextIcon",
    logo: undefined,
    widgets: {
        analytics: BloggingWidget
    },
    service: {
        fetch: BloggingService
    },
    url: '/blog',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default bloggingModule
