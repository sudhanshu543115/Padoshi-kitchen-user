"use client";

import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";
import { useState } from "react";
import Image from "next/image";

interface CartModalProps {
    onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
    const { cart, removeFromCart, updateQuantity, loading, totalItems, clearCart } = useCart();
    const { user } = useUser();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setIsCheckingOut(true);
        try {
            const kitchenId = cart[0].kitchenId;

            const payload = {
                kitchenId,
                delivery: {
                    mode: "KITCHEN_DELIVERY",
                    address: {
                        addressLine: user.address,
                        societyName: user.societyName,
                        geoLocation: {
                            type: "Point",
                            coordinates: user.geoLocation.coordinates
                        }
                    }
                }
            };

            const response = await api.post("user/cart/checkout", payload);

            if (response.data.success) {
                alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
                clearCart();
                onClose();
            } else {
                alert(`Checkout failed: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred during checkout. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => {
        const itemPrice = parseFloat(item.price.replace("₹", ""));
        const addonsPrice = item.addons.reduce((aSum, a) => aSum + (a.price || 0), 0);
        return sum + (itemPrice + addonsPrice) * item.quantity;
    }, 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shopping Cart</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {totalItems} {totalItems === 1 ? 'Item' : 'Items'} selected
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
                    >
                        <span className="text-2xl">✕</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Updating Cart...</p>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <span className="text-6xl">🛒</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
                                <p className="text-sm text-gray-500 mt-1 maxLength-32">Looks like you haven't added anything yet. Go explore some kitchens!</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg"
                            >
                                Shop Now
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4 group">
                                <div className="flex gap-4">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-inner shrink-0 leading-none">
                                        <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 truncate pr-2">{item.name}</h4>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors text-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">{item.variantLabel}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm font-black text-gray-900">{item.price}</span>
                                            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="text-gray-400 hover:text-orange-600 font-bold transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-white"
                                                >
                                                    −
                                                </button>
                                                <span className="text-xs font-black text-gray-900 w-4 text-center select-none">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="text-gray-400 hover:text-orange-600 font-bold transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-white"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-50 flex flex-wrap gap-2 leading-tight">
                                    <span className="text-[9px] font-black uppercase tracking-tighter bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">
                                        Spice: {item.customization.spiceLevel}
                                    </span>
                                    {item.customization.isJain && (
                                        <span className="text-[9px] font-black uppercase tracking-tighter bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">
                                            Jain Preferred
                                        </span>
                                    )}
                                    {item.addons.map((a, i) => (
                                        <span key={i} className="text-[9px] font-black uppercase tracking-tighter bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">
                                            +{a.name}
                                        </span>
                                    ))}
                                    {item.customization.notes && (
                                        <div className="w-full mt-1 px-2 py-1.5 bg-gray-50 rounded italic text-[10px] text-gray-500 leading-snug border-l-2 border-gray-200">
                                            "{item.customization.notes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 bg-white border-t border-gray-100 space-y-4 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-green-600 font-bold uppercase tracking-widest">
                                <span>Delivery Fee</span>
                                <span>FREE</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-50">
                                <span>Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className={`w-full ${isCheckingOut ? 'bg-gray-400' : 'bg-gray-900 hover:bg-orange-600'} text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2`}
                        >
                            {isCheckingOut ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                "Checkout Now"
                            )}
                        </button>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Secure Payment Powered by Padoshi Pay
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
