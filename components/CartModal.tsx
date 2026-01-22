"use client";

import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// --- Icons ---
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const MinusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>);
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>);

interface CartModalProps {
    onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
    const router = useRouter();
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
        // z-[9999] ensures it sits on top of everything, h-[100dvh] ensures full viewport height
        <div className="fixed inset-0 z-[9999] flex justify-end font-sans">
            
            {/* Backdrop with stronger blur */}
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Panel - Full Height */}
            <div className="relative w-full max-w-lg h-[100dvh] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-white/10">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-xl sticky top-0 z-10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">
                            {totalItems} {totalItems === 1 ? 'Item' : 'Items'} from <span className="text-orange-600">Padoshi Kitchen</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Cart Items Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scrollbar-hide">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Updating Cart...</p>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg shadow-slate-100">
                                <span className="text-5xl">🥣</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Your cart is empty</h3>
                                <p className="text-slate-500 mt-2 max-w-[250px] mx-auto leading-relaxed">
                                    Good food is always cooking! Go explore kitchens near you.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1"
                            >
                                Browse Kitchens
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:border-slate-200">
                                <div className="flex gap-5">
                                    {/* Item Image */}
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                                        <Image 
                                            src={item.img} 
                                            alt={item.name} 
                                            fill 
                                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start gap-3">
                                                <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{item.name}</h4>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1.5 -mr-2 -mt-2 rounded-full hover:bg-red-50"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mt-1.5 bg-orange-50 inline-block px-2 py-0.5 rounded-md">{item.variantLabel}</p>
                                        </div>

                                        <div className="flex items-end justify-between mt-3">
                                            <span className="text-lg font-black text-slate-900">{item.price}</span>
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-orange-600 hover:border-orange-200 border border-transparent transition-all active:scale-90"
                                                >
                                                    <MinusIcon />
                                                </button>
                                                <span className="text-sm font-black text-slate-900 w-4 text-center select-none">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-orange-600 hover:border-orange-200 border border-transparent transition-all active:scale-90"
                                                >
                                                    <PlusIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customizations Tags */}
                                {(item.customization.spiceLevel || item.customization.isJain || item.addons.length > 0 || item.customization.notes) && (
                                    <div className="pt-4 mt-4 border-t border-slate-50 flex flex-wrap gap-2">
                                        {item.customization.spiceLevel && (
                                            <span className="text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg border border-red-100 flex items-center gap-1">
                                                🌶 {item.customization.spiceLevel}
                                            </span>
                                        )}
                                        {item.customization.isJain && (
                                            <span className="text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-600 px-2.5 py-1.5 rounded-lg border border-green-100 flex items-center gap-1">
                                                🌱 Jain
                                            </span>
                                        )}
                                        {item.addons.map((a, i) => (
                                            <span key={i} className="text-[10px] font-bold uppercase tracking-wide bg-orange-50 text-orange-600 px-2.5 py-1.5 rounded-lg border border-orange-100">
                                                + {a.name}
                                            </span>
                                        ))}
                                        {item.customization.notes && (
                                            <div className="w-full text-xs text-slate-500 italic bg-slate-50 px-3 py-2 rounded-lg border-l-4 border-slate-300 mt-1">
                                                "{item.customization.notes}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout Section - Sticky Bottom */}
                {cart.length > 0 && (
                    <div className="p-8 bg-white border-t border-slate-100 space-y-6 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] z-20 shrink-0 pb-10">
                        {/* <div className="space-y-3">
                            <div className="flex justify-between text-base text-slate-500 font-medium">
                                <span>Subtotal</span>
                                <span className="text-slate-900 font-bold">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-green-600 font-bold uppercase tracking-widest">
                                <span>Delivery Fee</span>
                                <span className="bg-green-50 px-2 py-1 rounded">Calculated Next</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black text-slate-900 pt-4 border-t border-slate-100 mt-2">
                                <span>Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                        </div> */}

                        <button
                            onClick={() => {
                                onClose();
                                router.push("/checkout/delivery");
                            }}
                            className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${
                                isCheckingOut 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                : 'bg-slate-900 text-white hover:bg-orange-600 hover:shadow-orange-500/30'
                            }`}
                        >
                            {isCheckingOut ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    Proceed to Delivery <ArrowRightIcon />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}