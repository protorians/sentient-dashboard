import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {FetchResponseInterface} from "@/core/domain/typing/response";
import {
    CreateProductInterface,
    ProductInterface,
} from "@/modules/stock/domain/product.interface";
import {StockInterface} from "@/modules/stock/domain/stock.interface";
import {StockAnalyticsInterface} from "@/modules/stock/domain/stock-analytics.interface";
import {
    CreateProductCategoryInterface,
    ProductCategoryInterface,
    UpdateProductCategoryInterface,
} from "@/modules/stock/domain/product-category.interface";
import {CreateStockMovementInterface, StockMovementInterface} from "@/modules/stock/domain/stock-movement.interface";
import {
    WarehouseInterface,
    CreateWarehouseInterface,
    UpdateWarehouseInterface,
} from "@/modules/stock/domain/warehouse.interface";
import {TransferStockInterface} from "@/modules/stock/domain/transfer-stock.interface";

export class StockApiService extends ApiService {
    static async getWarehouses() {
        return await this.get<FetchResponseInterface<WarehouseInterface[]>>('/stock/warehouses');
    }

    static async createWarehouse(payload: CreateWarehouseInterface) {
        return await this.post<FetchResponseInterface<WarehouseInterface>>('/stock/warehouses', payload);
    }

    static async updateWarehouse(id: string, payload: UpdateWarehouseInterface) {
        return await this.put<FetchResponseInterface<WarehouseInterface>>(`/stock/warehouses/${id}`, payload);
    }

    static async deleteWarehouse(id: string) {
        return await this.delete<FetchResponseInterface<{ deleted: boolean }>>(`/stock/warehouses/${id}`);
    }

    static async getAll() {
        return await this.get<FetchResponseInterface<ProductInterface[]>>('/stock/products');
    }

    static async createProduct(payload: CreateProductInterface) {
        return await this.post<FetchResponseInterface<ProductInterface>>('/stock/products', payload);
    }

    static async getProductStock(id: string) {
        return await this.get<FetchResponseInterface<StockInterface>>(`/stock/products/${id}/stock`);
    }

    static async getProductMovements(id: string) {
        return await this.get<FetchResponseInterface<StockMovementInterface[]>>(`/stock/products/${id}/movements`);
    }

    static async createMovement(payload: CreateStockMovementInterface) {
        return await this.post<FetchResponseInterface<StockMovementInterface>>('/stock/movements', payload);
    }

    static async createTransfer(payload: TransferStockInterface) {
        return await this.post<FetchResponseInterface<any>>('/stock/transfers', payload);
    }

    static async getProductCategories() {
        return await this.get<FetchResponseInterface<ProductCategoryInterface[]>>('/stock/categories');
    }

    static async createProductCategory(payload: CreateProductCategoryInterface) {
        return await this.post<FetchResponseInterface<ProductCategoryInterface>>('/stock/categories', payload);
    }

    static async getProductCategory(id: string) {
        return await this.get<FetchResponseInterface<ProductCategoryInterface>>(`/stock/categories/${id}`);
    }

    static async updateProductCategory(id: string, payload: UpdateProductCategoryInterface) {
        return await this.put<FetchResponseInterface<ProductCategoryInterface>>(`/stock/categories/${id}`, payload);
    }

    static async deleteProductCategory(id: string) {
        return await this.delete<FetchResponseInterface<{ deleted: boolean }>>(`/stock/categories/${id}`);
    }

    static async getAnalytics() {
        return await this.get<FetchResponseInterface<StockAnalyticsInterface>>('/stock/analytics');
    }
}
