"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/api/axios";

export interface CartItem {
    id: string;
    kitchenId: string;
    menuItemId: string;
    name: string;
    price: string;
    img: string;
    quantity: number;
    variantLabel: string;
    addons: { name: string; price: number }[];
    customization: {
        spiceLevel: string;
        isJain: boolean;
        notes: string;
    };
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    fetchCart: () => Promise<void>;
    totalItems: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await api.get("user/cart");
            if (response.data.success) {
                const cartData = response.data.cart;
                const kitchenIdFromCart = cartData?.kitchenId;

                const items = (cartData?.items || []).map((item: any, index: number) => {
                    const unitPrice = item.variant?.price || 0;
                    const addonsPrice = (item.addons || []).reduce((sum: number, a: any) => sum + (a.price || 0), 0);

                    return {
                        id: item._id || `${item.menuItemId}-${index}`,
                        kitchenId: kitchenIdFromCart || item.kitchenId,
                        menuItemId: item.menuItemId,
                        name: item.name,
                        price: `₹${unitPrice + addonsPrice}`,
                        img: item.img || item.menuItem?.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format",
                        quantity: item.quantity,
                        variantLabel: item.variant?.label || "Regular",
                        addons: item.addons || [],
                        customization: item.customization || { spiceLevel: "Medium", isJain: false, notes: "" }
                    };
                });
                setCart(items);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch cart only if token exists
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (token) {
            fetchCart();
        }
    }, []);

    const addToCart = async (newItem: Omit<CartItem, "quantity">) => {
        try {
            const response = await api.post("user/cart", {
                kitchenId: newItem.kitchenId,
                menuItemId: newItem.menuItemId,
                variantLabel: newItem.variantLabel,
                quantity: 1, 
                addons: newItem.addons.map(a => ({ name: a.name })), 
                customization: newItem.customization
            });

            if (response.data.success) {
                await fetchCart();
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            await removeFromCart(itemId);
            return;
        }

        setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));

        try {
        } catch (error) {
            console.error("Failed to update quantity:", error);
            await fetchCart();
        }
    };

    const removeFromCart = async (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));

        try {
            await api.delete(`user/cart/${itemId}`);
        } catch (error) {
            console.error("Failed to remove from cart:", error);
            await fetchCart(); 
        }
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart, totalItems, loading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
