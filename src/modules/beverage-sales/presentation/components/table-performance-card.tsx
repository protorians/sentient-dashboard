import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {WineIcon} from "lucide-react";
import {PosAnalyticsTableInfo} from "@/modules/beverage-sales/domain/pos-analytics.interface";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

export function TablePerformanceCard({tableInfo, rank}: { tableInfo: PosAnalyticsTableInfo; rank?: number }) {
    const maxRevenue = Math.max(1, ...tableInfo.products.map(p => p.revenue));

    return (
        <Card className="border-none shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <WineIcon className="size-4 text-primary"/>
                        {tableInfo.tableLabel ?? 'Sans table'}
                    </CardTitle>
                    {rank != null && (
                        <span className="text-xs font-bold text-muted-foreground tabular-nums">#{rank + 1}</span>
                    )}
                </div>
                <CardDescription>
                    {tableInfo.orderCount} commande{tableInfo.orderCount > 1 ? 's' : ''} · {formatPrice(tableInfo.totalRevenue)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2.5">
                    {tableInfo.products.map((p) => (
                        <div key={p.productId} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground truncate max-w-[60%]">{p.productName}</span>
                                <div className="flex items-center gap-3 tabular-nums shrink-0">
                                    <span className="text-xs text-muted-foreground">×{p.quantity}</span>
                                    <span className="font-medium">{formatPrice(p.revenue)}</span>
                                </div>
                            </div>
                            <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary/40 transition-all duration-500"
                                    style={{width: `${Math.round((p.revenue / maxRevenue) * 100)}%`}}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
