import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/core/presentation/ui/table";
import {PosAnalyticsProduct} from "@/modules/beverage-sales/domain/pos-analytics.interface";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

export function TopProductsTable({products}: { products: PosAnalyticsProduct[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Produit</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">Revenus</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((p) => (
                    <TableRow key={p.productId}>
                        <TableCell className="font-medium text-sm">{p.productName}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{p.sku}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{p.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{formatPrice(p.revenue)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
