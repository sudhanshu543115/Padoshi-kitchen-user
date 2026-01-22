"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import api from "@/api/axios";

/* ---------- Types ---------- */

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

/* ---------- Context ---------- */

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    /* ---------- Fetch Cart ---------- */

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await api.get("user/cart");

            if (response.data.success) {
                const cartData = response.data.cart;
                const kitchenIdFromCart = cartData?.kitchenId;

                const items: CartItem[] = (cartData?.items || []).map(
                    (item: any, index: number) => {
                        const unitPrice = item.variant?.price || 0;
                        const addonsPrice = (item.addons || []).reduce(
                            (sum: number, a: any) => sum + (a.price || 0),
                            0
                        );

                        return {
                            id: item._id || `${item.menuItemId}-${index}`,
                            kitchenId: kitchenIdFromCart || item.kitchenId,
                            menuItemId: item.menuItemId,
                            name: item.name,
                            price: `₹${unitPrice + addonsPrice}`,
                            img:
                                item.img ||
                                item.menuItem?.imageUrl ||
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format",
                            quantity: item.quantity,
                            variantLabel: item.variant?.label || "Standard",
                            addons: item.addons || [],
                            customization:
                                item.customization || {
                                    spiceLevel: "Medium",
                                    isJain: false,
                                    notes: "",
                                },
                        };
                    }
                );

                setCart(items);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    };

    /* ---------- Initial Load ---------- */

    useEffect(() => {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("accessToken")
                : null;

        if (token) {
            fetchCart();
        }
    }, []);

    /* ---------- Add To Cart ---------- */

    const addToCart = async (newItem: Omit<CartItem, "quantity">) => {
        try {
            const response = await api.post("user/cart", {
                kitchenId: newItem.kitchenId,
                menuItemId: newItem.menuItemId,
                variantLabel: newItem.variantLabel,
                quantity: 1,
                addons: newItem.addons.map((a) => ({ name: a.name })),
                customization: newItem.customization,
            });

            if (response.data.success) {
                await fetchCart();
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    /* ---------- Update Quantity ---------- */

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        const item = cart.find((i) => i.id === itemId);
        if (!item) return;

        if (newQuantity < 1) {
            await removeFromCart(itemId);
            return;
        }

        setCart((prev) =>
            prev.map((i) =>
                i.id === itemId ? { ...i, quantity: newQuantity } : i
            )
        );

        try {
            await api.patch("user/cart", {
                kitchenId: item.kitchenId,
                menuItemId: item.menuItemId,
                variantLabel: item.variantLabel,
                quantity: newQuantity,
                addons: item.addons.map((a) => ({ name: a.name })),
            });
        } catch (error) {
            console.error("Failed to update quantity:", error);
            await fetchCart();
        }
    };

    /* ---------- REMOVE FROM CART (PATCH API) ---------- */

    const removeFromCart = async (itemId: string) => {
        const item = cart.find((i) => i.id === itemId);
        if (!item) return;

        setCart((prev) => prev.filter((i) => i.id !== itemId));

        try {
            await api.patch("user/cart", {
                kitchenId: item.kitchenId,
                menuItemId: item.menuItemId,
                variantLabel: item.variantLabel,
                addons: item.addons.map((a) => ({ name: a.name })),
            });
        } catch (error) {
            console.error("Failed to remove from cart:", error);
            await fetchCart();
        }
    };

    /* ---------- Helpers ---------- */

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                fetchCart,
                totalItems,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

/* ---------- Hook ---------- */

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
