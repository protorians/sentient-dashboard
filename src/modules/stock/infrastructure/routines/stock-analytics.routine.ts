import {Routine} from "@/core/infrastructure/routines/routine";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {StockAnalyticsInterface} from "@/modules/stock/domain/stock-analytics.interface";
import {RoutineInterface} from "@/core/domain/typing/routine.types";

export interface StockAnalyticsDataRoutine extends StockAnalyticsInterface {

}

export class StockAnalyticsRoutine extends Routine<StockAnalyticsDataRoutine>
    implements RoutineInterface<StockAnalyticsDataRoutine> {

    constructor() {
        super('stock.analytics', {
            icon: 'ChartNoAxesCombined',
            name: 'Service Analytique en temps reel'
        });
    }

    async job(): Promise<StockAnalyticsDataRoutine | undefined> {
        return new Promise(async (resolve) => {
            const response = await StockApiService.getAnalytics();
            if (
                (!response) ||
                (!response.data) ||
                (!response.data.data)
            ) throw new Error('Impossible de charger les données analytiques du stock');
            resolve(response.data.data);
        })
    }

    onFail(error: Error) {
        this.setOption('icon', 'MessageCircleWarning')
    }

}

export const stockAnalyticsRoutine = new StockAnalyticsRoutine();
