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
import {CreateOrderInterface, OrderInterface, UpdateOrderInterface} from "@/modules/stock/domain/order.interface";
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";

export class StockApiService extends ApiService {
    // Warehouses
    static async getWarehouses() {
        return await this.get<FetchResponseInterface<WarehouseInterface[]>>('/stock/warehouses');
    }

    // Products
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

    // Movements
    static async createMovement(payload: CreateStockMovementInterface) {
        return await this.post<FetchResponseInterface<StockMovementInterface>>('/stock/movements', payload);
    }

    // Product categories
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

    // Analytics
    static async getAnalytics() {
        return await this.get<FetchResponseInterface<StockAnalyticsInterface>>('/stock/analytics');
    }

    // Orders
    static async getOrders() {
        return await this.get<FetchResponseInterface<OrderInterface[]>>('/stock/orders');
    }

    static async createOrder(payload: CreateOrderInterface) {
        return await this.post<FetchResponseInterface<OrderInterface>>('/stock/orders', payload);
    }

    static async getOrder(id: string) {
        return await this.get<FetchResponseInterface<OrderInterface>>(`/stock/orders/${id}`);
    }

    static async updateOrder(id: string, payload: UpdateOrderInterface) {
        return await this.put<FetchResponseInterface<OrderInterface>>(`/stock/orders/${id}`, payload);
    }

    static async deleteOrder(id: string) {
        return await this.delete<FetchResponseInterface<{ deleted: boolean }>>(`/stock/orders/${id}`);
    }
}
