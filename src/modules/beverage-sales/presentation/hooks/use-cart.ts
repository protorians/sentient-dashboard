"use client"

import {useState, useEffect} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {CartItemLine, CartBundleLine} from "@/modules/beverage-sales/domain/cart.types";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";

const CART_STORAGE_KEY = "beverage-sales:cart";
const ACTIVE_ORDER_KEY = "beverage-sales:active-order-id";

function loadStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveStorage(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

function removeStorage(key: string) {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

function loadCart(): { items: CartItemLine[]; bundleLines: CartBundleLine[] } {
    return loadStorage(CART_STORAGE_KEY, {items: [] as CartItemLine[], bundleLines: [] as CartBundleLine[]});
}

function saveCart(items: CartItemLine[], bundleLines: CartBundleLine[]) {
    saveStorage(CART_STORAGE_KEY, {items, bundleLines});
}

export function loadActiveOrderId(): string | null {
    return loadStorage<string | null>(ACTIVE_ORDER_KEY, null);
}

export function saveActiveOrderId(orderId: string | null) {
    if (orderId) {
        saveStorage(ACTIVE_ORDER_KEY, orderId);
    } else {
        removeStorage(ACTIVE_ORDER_KEY);
    }
}

export interface UseCartReturn {
    items: CartItemLine[];
    bundleLines: CartBundleLine[];
    orderId: string | null;
    addToCart: (product: ProductInterface, unit: MovementUnitEnum, unitPrice: number) => void;
    updateItemQty: (productId: string, quantity: number) => void;
    updateItemUnit: (productId: string, unit: MovementUnitEnum) => void;
    removeFromCart: (productId: string) => void;
    addBundleToCart: (bundle: BundleInterface, unitPrice: number) => void;
    updateBundleQty: (bundleId: string, quantity: number) => void;
    removeBundleFromCart: (bundleId: string) => void;
    clearCart: () => void;
    loadFromOrder: (orderId: string, items: CartItemLine[], bundleLines: CartBundleLine[]) => void;
    setOrderId: (orderId: string | null) => void;
}

export function useCart(): UseCartReturn {
    const [items, setItems] = useState<CartItemLine[]>(() => loadCart().items);
    const [bundleLines, setBundleLines] = useState<CartBundleLine[]>(() => loadCart().bundleLines);
    const [orderId, setOrderId] = useState<string | null>(() => loadActiveOrderId());

    useEffect(() => {
        if (items.length === 0 && bundleLines.length === 0) {
            if (typeof window !== "undefined") {
                localStorage.removeItem(CART_STORAGE_KEY);
            }
        } else {
            saveCart(items, bundleLines);
        }
    }, [items, bundleLines]);

    useEffect(() => {
        saveActiveOrderId(orderId);
    }, [orderId]);

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
        setOrderId(null);
    };

    const loadFromOrder = (orderId: string, orderItems: CartItemLine[], orderBundleLines: CartBundleLine[]) => {
        setOrderId(orderId);
        setItems(orderItems);
        setBundleLines(orderBundleLines);
    };

    return {
        items,
        bundleLines,
        orderId,
        addToCart,
        updateItemQty,
        updateItemUnit,
        removeFromCart,
        addBundleToCart,
        updateBundleQty,
        removeBundleFromCart,
        clearCart,
        loadFromOrder,
        setOrderId,
    };
}
