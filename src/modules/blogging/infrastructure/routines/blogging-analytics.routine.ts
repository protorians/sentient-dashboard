import {Routine} from "@/core/infrastructure/routines/routine";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {PostAnalyticsVm} from "@/modules/blogging/domain/blogging.interface";
import {RoutineInterface} from "@/core/domain/typing/routine.types";

export interface BloggingAnalyticsDataRoutine extends PostAnalyticsVm {

}

export class BloggingAnalyticsRoutine extends Routine<BloggingAnalyticsDataRoutine>
    implements RoutineInterface<BloggingAnalyticsDataRoutine> {

    constructor() {
        super('blogging.analytics', {
            icon: 'ChartNoAxesCombined',
            name: 'Service Analytique du blog'
        });
    }

    async job(): Promise<BloggingAnalyticsDataRoutine | undefined> {
        return new Promise(async (resolve) => {
            const response = await BloggingApiService.getAnalytics();
            if (
                (!response) ||
                (!response.data)
            ) throw new Error('Impossible de charger les données analytiques du blog');
            const data = response.data?.data || response.data;
            resolve(data);
        })
    }

    onFail(error: Error) {
        this.setOption('icon', 'MessageCircleWarning')
    }

}

export const bloggingAnalyticsRoutine = new BloggingAnalyticsRoutine();
