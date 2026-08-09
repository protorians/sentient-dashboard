import {cn} from "@/core/infrastructure/utilities/utils";
import {PosTopCustomer} from "@/modules/beverage-sales/domain/pos-sales-analytics.interface";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

const MEDAL_STYLES = [
    {bg: "bg-amber-400/15 text-amber-600", ring: "ring-amber-400/30"},
    {bg: "bg-slate-400/15 text-slate-500", ring: "ring-slate-400/30"},
    {bg: "bg-orange-400/15 text-orange-600", ring: "ring-orange-400/30"},
];

export function TopCustomersList({customers}: { customers: PosTopCustomer[] }) {
    const maxRevenue = Math.max(1, ...customers.map(c => c.totalRevenue));

    return (
        <div className="space-y-3">
            {customers.map((tc, idx) => {
                const medal = MEDAL_STYLES[idx];
                return (
                    <div
                        key={tc.customerId ?? `unknown-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        <div className={cn(
                            "flex-shrink-0 size-10 rounded-full flex items-center justify-center ring-2",
                            medal?.bg ?? "bg-primary/10 text-primary",
                            idx < 3 ? medal?.ring : "ring-transparent"
                        )}>
                            <span className="text-sm font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-sm truncate">{tc.customerName ?? 'Client de passage'}</p>
                                <span className="font-bold tabular-nums text-sm shrink-0">{formatPrice(tc.totalRevenue)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {tc.orderCount} commande{tc.orderCount > 1 ? 's' : ''}
                            </p>
                            <div className="mt-1.5 h-1 w-full rounded-full bg-muted/60 overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-500", medal?.bg ?? "bg-primary/40")}
                                    style={{width: `${Math.round((tc.totalRevenue / maxRevenue) * 100)}%`}}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
