import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/core/presentation/ui/table";
import {Badge} from "@/core/presentation/ui/badge";
import {PosSalesByProduct} from "@/modules/beverage-sales/domain/pos-sales-analytics.interface";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

export function SalesByProductTable({products, limit}: { products: PosSalesByProduct[]; limit?: number }) {
    const rows = limit ? products.slice(0, limit) : products;
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">Nbre cmd</TableHead>
                    <TableHead className="text-right">Revenus</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((sp) => (
                    <TableRow key={sp.productId}>
                        <TableCell className="font-medium text-sm">
                            <div>{sp.productName}</div>
                            <div className="text-muted-foreground text-xs">{sp.sku}</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{sp.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">{sp.orderCount}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{formatPrice(sp.revenue)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                            <Badge variant={sp.remainingStock <= 5 ? "destructive" : "secondary"} className="text-xs">
                                {sp.remainingStock}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
