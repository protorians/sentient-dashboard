import {ActivityInterface} from "@/core/domain/entities/activities.interface";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import {retrieveModule} from "@/core/infrastructure/utilities/modules";
import {Fragment} from "react";
import {capitalizeFirstLetter} from "@/core/infrastructure/utilities/strings.util";
import {ActivityDescriptorParser} from "@/core/presentation/components/activity-descriptor-parser";


export function explainActivityAction(method: string): string {
    switch (method.toUpperCase()) {
        default:
            return method;
        case 'GET':
            return 'Lecture';
        case 'POST':
            return 'Création';
        case 'PUT':
            return 'Modification';
        case 'DELETE':
            return 'Suppression';
    }
}

export function explainActivityActionVerb(action?: string) {
    switch (action?.toLowerCase()) {
        case 'get':
            return '*a lu*';
        case 'post':
            return '*a créé*';
        case 'patch':
        case 'put':
            return '*a modifié*';
        case 'delete':
            return '*a supprimé*';
        default:
            return '*a effectué*';
    }
}

export function ActivityDescriptor(activity: ActivityInterface) {
    const module = retrieveModule(activity.module);
    const defaultTemplate = `${
        capitalizeFirstLetter(activity.user?.username)
    } ${
        explainActivityActionVerb(activity.action)
    } ${module ? `dans le module ${module.name}` : 'dans un module'}`

    return (
        <Fragment>
            <ActivityDescriptorParser template={activity.describe ?? defaultTemplate} context={activity}/>
        </Fragment>
    );
}

