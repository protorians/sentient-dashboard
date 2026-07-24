import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
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
        fetch: BloggingApiService
    },
    url: '/blog',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default bloggingModule
