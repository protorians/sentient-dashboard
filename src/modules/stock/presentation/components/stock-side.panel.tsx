import {StockAnalyticsData} from "@/modules/stock/presentation/components/stock-analytics-data";

export function StockSidePanel() {
    return (
        <div className="w-full lg:max-w-[25dvw] ">
            <div className="flex flex-col gap-4">
                <div className="">
                    <StockAnalyticsData/>
                </div>
                <div className="sticky top-20 ">

                </div>
            </div>
        </div>
    )
}
