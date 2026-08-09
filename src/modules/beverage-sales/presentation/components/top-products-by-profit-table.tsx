import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/core/presentation/ui/table";
import {PosProfitProduct} from "@/modules/beverage-sales/domain/pos-profit-loss.interface";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

export function TopProductsByProfitTable({products}: { products: PosProfitProduct[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Produit</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">Revenus</TableHead>
                    <TableHead className="text-right">Dépenses</TableHead>
                    <TableHead className="text-right">Bénéfice</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((tp) => (
                    <TableRow key={tp.productId}>
                        <TableCell className="font-medium text-sm">{tp.productName}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{tp.sku}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{tp.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{formatPrice(tp.revenue)}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-red-600">{formatPrice(tp.expenses)}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-medium">{formatPrice(tp.profit)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
