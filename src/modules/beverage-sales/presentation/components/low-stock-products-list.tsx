import {Badge} from "@/core/presentation/ui/badge";
import {cn} from "@/core/infrastructure/utilities/utils";
import {PosSalesByProduct} from "@/modules/beverage-sales/domain/pos-sales-analytics.interface";

export function LowStockProductsList({products, threshold = 10}: { products: PosSalesByProduct[]; threshold?: number }) {
    const lowStock = products
        .filter(sp => sp.remainingStock <= threshold)
        .sort((a, b) => a.remainingStock - b.remainingStock);

    if (lowStock.length === 0) {
        return (
            <p className="text-center text-muted-foreground text-sm py-8">
                Tous les produits ont un stock suffisant
            </p>
        );
    }

    return (
        <div className="space-y-2.5">
            {lowStock.map(sp => {
                const isOut = sp.remainingStock === 0;
                const fill = isOut ? "bg-red-500" : "bg-amber-500";
                const width = Math.max(4, Math.round((sp.remainingStock / threshold) * 100));
                return (
                    <div key={sp.productId} className="flex items-center gap-3 text-sm p-2.5 rounded-xl bg-muted/20">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium truncate">{sp.productName}</span>
                                <Badge
                                    variant={isOut ? "destructive" : "outline"}
                                    className={cn("text-xs shrink-0", !isOut && "text-amber-600 border-amber-500/30")}
                                >
                                    {isOut ? "Rupture" : `Stock: ${sp.remainingStock}`}
                                </Badge>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-500", fill)} style={{width: `${width}%`}}/>
                            </div>
                        </div>
                        <span className="text-muted-foreground text-xs shrink-0 tabular-nums">
                            Vendus: {sp.quantity}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
