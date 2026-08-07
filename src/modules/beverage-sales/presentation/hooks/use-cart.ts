"use client"

import {useState} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {CartItemLine, CartBundleLine} from "@/modules/beverage-sales/domain/cart.types";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";

export interface UseCartReturn {
    items: CartItemLine[];
    bundleLines: CartBundleLine[];
    addToCart: (product: ProductInterface, unit: MovementUnitEnum, unitPrice: number) => void;
    updateItemQty: (productId: string, quantity: number) => void;
    updateItemUnit: (productId: string, unit: MovementUnitEnum) => void;
    removeFromCart: (productId: string) => void;
    addBundleToCart: (bundle: BundleInterface, unitPrice: number) => void;
    updateBundleQty: (bundleId: string, quantity: number) => void;
    removeBundleFromCart: (bundleId: string) => void;
    clearCart: () => void;
    loadFromOrder: (items: CartItemLine[], bundleLines: CartBundleLine[]) => void;
}

export function useCart(): UseCartReturn {
    const [items, setItems] = useState<CartItemLine[]>([]);
    const [bundleLines, setBundleLines] = useState<CartBundleLine[]>([]);

    const addToCart = (product: ProductInterface, unit: MovementUnitEnum, unitPrice: number) => {
        if (!product.id) return;
        setItems(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing && existing.unit === unit) {
                return prev.map(item =>
                    item.productId === product.id
                        ? {...item, quantity: item.quantity + 1}
                        : item
                );
            }
            return [...prev, {productId: product.id!, quantity: 1, unit, unitPrice}];
        });
    };

    const updateItemQty = (productId: string, quantity: number) => {
        setItems(prev => quantity <= 0
            ? prev.filter(item => item.productId !== productId)
            : prev.map(item => item.productId === productId ? {...item, quantity} : item)
        );
    };

    const updateItemUnit = (productId: string, unit: MovementUnitEnum) => {
        setItems(prev => prev.map(item => item.productId === productId ? {...item, unit} : item));
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const addBundleToCart = (bundle: BundleInterface, unitPrice: number) => {
        setBundleLines(prev => {
            const existing = prev.find(line => line.bundleId === bundle.id);
            if (existing) {
                return prev.map(line =>
                    line.bundleId === bundle.id
                        ? {...line, quantity: line.quantity + 1}
                        : line
                );
            }
            return [...prev, {bundleId: bundle.id, quantity: 1, unitPrice}];
        });
    };

    const updateBundleQty = (bundleId: string, quantity: number) => {
        setBundleLines(prev => quantity <= 0
            ? prev.filter(line => line.bundleId !== bundleId)
            : prev.map(line => line.bundleId === bundleId ? {...line, quantity} : line)
        );
    };

    const removeBundleFromCart = (bundleId: string) => {
        setBundleLines(prev => prev.filter(line => line.bundleId !== bundleId));
    };

    const clearCart = () => {
        setItems([]);
        setBundleLines([]);
    };

    const loadFromOrder = (orderItems: CartItemLine[], orderBundleLines: CartBundleLine[]) => {
        setItems(orderItems);
        setBundleLines(orderBundleLines);
    };

    return {
        items,
        bundleLines,
        addToCart,
        updateItemQty,
        updateItemUnit,
        removeFromCart,
        addBundleToCart,
        updateBundleQty,
        removeBundleFromCart,
        clearCart,
        loadFromOrder,
    };
}
