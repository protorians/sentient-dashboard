import {Routine} from "@/core/infrastructure/routines/routine";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {BillingAnalyticsInterface} from "@/modules/billing/domain/billing-analytics.interface";

export class BillingAnalyticsRoutine extends Routine<BillingAnalyticsInterface> {

    constructor() {
        super('billing.analytics', {
            icon: 'ChartNoAxesCombined',
            name: 'Service Analytique en temps réel'
        });
    }

    async job(): Promise<BillingAnalyticsInterface | undefined> {
        return new Promise(async (resolve) => {
            const response = await BillingApiService.getAnalytics();
            if (
                (!response) ||
                (!response.data) ||
                (!response.data.data)
            ) throw new Error('Impossible de charger les données analytiques de facturation');
            resolve(response.data.data);
        })
    }

    onFail(error: Error) {
        this.setOption('icon', 'MessageCircleWarning')
    }

}

export const billingAnalyticsRoutine = new BillingAnalyticsRoutine();
