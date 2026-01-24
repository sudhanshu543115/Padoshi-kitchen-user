"use client";

import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// --- Icons ---
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const MinusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>);
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>);
const MapPinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>);
const BikeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const StoreIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>);
const CreditCardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>);
const CashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>);

interface CartModalProps {
    onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, loading, totalItems, clearCart } = useCart();
    const { user } = useUser();

    // UI State
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [view, setView] = useState<'cart' | 'invoice'>('cart');

    // Delivery Selection State
    const [deliveryMode, setDeliveryMode] = useState("platform"); // platform | own | pickup
    const [paymentMethod, setPaymentMethod] = useState("online"); // online | cod
    const [addresses, setAddresses] = useState<any[]>([]);
    const [defaultAddress, setDefaultAddress] = useState<any>(null);
    // const [kitchenInfo, setKitchenInfo] = useState<any>(null);



    const [pricing, setPricing] = useState<{
        foodTotal: number;
        deliveryCharge: number;
        finalAmount: number;
    } | null>(null);

    const [pricingLoading, setPricingLoading] = useState(false);



    // Mappings for API
    const deliveryModeMap: Record<string, string> = {
        platform: "PADOSHI_DELIVERY",
        pickup: "SELF_PICKUP",
        own: "THIRD_PARTY",
    };

    const paymentMethodMap: Record<string, string> = {
        online: "UPI",
        cod: "COD",
    };


    const fetchPricingPreview = async () => {
        if (!cart.length) {
            setPricing(null);
            return;
        }

        try {
            setPricingLoading(true);

            const payload: any = {
                delivery: {
                    mode: deliveryModeMap[deliveryMode] || "PADOSHI_DELIVERY",
                },
            };

            if (deliveryMode !== "pickup" && defaultAddress?._id) {
                payload.delivery.addressId = defaultAddress._id;
            }

            const res = await api.post(
                "user/cart/checkout/preview",
                payload
            );

            if (res.data.success) {
                setPricing(res.data.pricing);
            }
        } catch (err) {
            console.error("Pricing preview failed", err);
            setPricing(null);
        } finally {
            setPricingLoading(false);
        }
    };






    // Fetch Initial Data (Addresses & Kitchen Capabilities)
    useEffect(() => {
        const fetchInitialData = async () => {
            if (cart.length === 0) return;

            try {
                // 1. Fetch User Addresses
                const addressRes = await api.get("user/auth/address");
                if (addressRes.data.success) {
                    setAddresses(addressRes.data.addresses);
                    const def = addressRes.data.addresses.find((a: any) => a.isDefault);
                    setDefaultAddress(def || addressRes.data.addresses[0] || null);
                }

                // 2. Fetch Kitchen Capabilities
                // const kitchenId = cart[0].kitchenId;
                // const kitchenRes = await api.get(`user/kitchens/${kitchenId}`);
                // console.log("Kitchen Data:", kitchenRes.data);

                // if (kitchenRes.data.success) {
                //     const k = kitchenRes.data.kitchen;
                //     setKitchenInfo({
                //         ...k,
                //         deliveryCapabilities: k.deliveryCapabilities || {
                //             ownRider: true,
                //             partner: true,
                //             thirdParty: true
                //         },
                //         deliveryPricing: k.deliveryPricing
                //     });
                // }
            } catch (error) {
                console.error("Failed to load delivery options:", error);
            }
        };

        fetchInitialData();
    }, [cart]);

    useEffect(() => {
        fetchPricingPreview();
    }, [cart, deliveryMode, defaultAddress]);


    const handleProceed = () => {
        if (view === 'cart') {
            setView('invoice');
        } else {
            // Failsafe, should not happen as button action calls handleConfirmOrder in invoice view
        }
    };

    // Handles actual order placement or redirection
    const handleConfirmOrder = async () => {
        if (!cart.length) return;

        // Validation for delivery
        if (deliveryMode !== "pickup" && !defaultAddress) {
            toast.error("Please select a delivery address");
            return;
        }

        setIsCheckingOut(true);

        try {
            if (paymentMethod === 'cod') {
                // --- COD: PLACE ORDER DIRECTLY ---
                const payload: any = {
                    delivery: {
                        mode: deliveryModeMap[deliveryMode] || "PADOSHI_DELIVERY",
                    },
                    payment: {
                        method: "COD",
                    },
                };

                if (deliveryMode !== "pickup") {
                    payload.delivery.addressId = defaultAddress._id;
                }

                const res = await api.post("user/cart/checkout", payload);

                if (res.data.success) {
                    toast.success("Order placed successfully! 🚀");
                    clearCart();
                    onClose();

                    // Delay redirect slightly to let user see the success toast
                    setTimeout(() => {
                        router.push("/discover");
                    }, 1500);
                } else {
                    toast.error(res.data.message || "Checkout failed");
                }

            } else {
                // --- ONLINE: REDIRECT TO UPI PAGE ---
                // User requested flow for online logic
                onClose();
                router.push("/checkout/delivery/payment/upi");
            }

        } catch (err: any) {
            console.error("Checkout error", err);
            toast.error(err?.response?.data?.message || "Checkout failed");
        } finally {
            setIsCheckingOut(false);
        }
    };

    // const subtotal = cart.reduce((sum, item) => {
    //     const itemPrice = parseFloat(item.price.replace("₹", ""));
    //     const addonsPrice = item.addons.reduce((aSum, a) => aSum + (a.price || 0), 0);
    //     return sum + (itemPrice + addonsPrice) * item.quantity;
    // }, 0);

    // let deliveryFee = 0;
    // if (deliveryMode === 'platform') deliveryFee = kitchenInfo?.deliveryPricing?.baseFee || 40;
    // if (deliveryMode === 'pickup') deliveryFee = 0;

    // const total = subtotal + deliveryFee;


    const subtotal = pricing?.foodTotal || 0;
    const deliveryFee = pricing?.deliveryCharge || 0;
    const total = pricing?.finalAmount || 0;


    return (
        <div className="fixed inset-0 z-[9999] flex justify-end font-sans">
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg h-[100dvh] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-white/10">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-xl sticky top-0 z-10 shrink-0">
                    <div>
                        {view === 'cart' ? (
                            <>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart</h2>
                                <p className="text-sm font-bold text-slate-400 mt-1">
                                    {totalItems} {totalItems === 1 ? 'Item' : 'Items'} from <span className="text-orange-600">Padoshi Kitchen</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Invoice</h2>
                                <p className="text-sm font-bold text-slate-400 mt-1">Review your order details</p>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {view === 'invoice' && (
                            <button
                                onClick={() => setView('cart')}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors"
                            >
                                Edit Cart
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide">
                    {view === 'cart' ? (
                        /* --- CART VIEW --- */
                        <>
                            <div className="p-6 space-y-6">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                                        <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Updating Cart...</p>
                                    </div>
                                ) : cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20">
                                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg shadow-slate-100">
                                            <span className="text-5xl">🥣</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">Your cart is empty</h3>
                                            <p className="text-slate-500 mt-2 max-w-[250px] mx-auto leading-relaxed">Good food is always cooking! Go explore kitchens near you.</p>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1"
                                        >
                                            Browse Kitchens
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="group bg-white rounded-3xl p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                                                <div className="flex gap-4">
                                                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                                                        <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                        <div>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{item.name}</h4>
                                                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"><TrashIcon /></button>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mt-1">{item.variantLabel}</p>
                                                        </div>
                                                        <div className="flex items-end justify-between mt-2">
                                                            <span className="text-base font-black text-slate-900">{item.price}</span>
                                                            <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-100">
                                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-400 hover:text-orange-600"><MinusIcon /></button>
                                                                <span className="text-xs font-black text-slate-900 w-3 text-center">{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-400 hover:text-orange-600"><PlusIcon /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {(item.customization.spiceLevel || item.customization.isJain || item.addons.length > 0) && (
                                                    <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-1.5">
                                                        {item.addons.map((a, i) => <span key={i} className="text-[9px] font-bold uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">+{a.name}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Delivery & Address (Visible if cart has items) */}
                            {cart.length > 0 && (
                                <div className="px-6 pb-6 space-y-6">
                                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <span className="bg-slate-100 p-1.5 rounded-full"><MapPinIcon /></span>
                                            Deliver To
                                        </h3>
                                        {deliveryMode === 'pickup' ? (
                                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center">
                                                <p className="font-bold text-orange-800 text-sm">Self Pickup Selected</p>
                                                <p className="text-xs text-orange-600 mt-1">You will pick up the order from the kitchen.</p>
                                            </div>
                                        ) : (
                                            <>
                                                {defaultAddress ? (
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                                                        <div className="mt-0.5 text-orange-500"><MapPinIcon /></div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-slate-200">{defaultAddress.label || "Home"}</span>
                                                                <button onClick={() => router.push("/checkout/address")} className="text-xs font-bold text-orange-600 hover:underline">Change</button>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-800 leading-tight">{defaultAddress.addressLine}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">{defaultAddress.societyName}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => router.push("/checkout/address")} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-orange-400 hover:text-orange-600 transition-colors flex flex-col items-center gap-2">
                                                        <MapPinIcon />
                                                        <span className="text-xs">Add Delivery Address</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <span className="bg-slate-100 p-1.5 rounded-full"><BikeIcon /></span>
                                            Delivery Method
                                        </h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "platform", label: "Kitchen Rider", icon: <BikeIcon />, desc: "Fastest" },
                                                { id: "own", label: "Third Party", icon: <UserIcon />, desc: "Dunzo" },
                                                { id: "pickup", label: "Self Pickup", icon: <StoreIcon />, desc: "No Fee" },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setDeliveryMode(opt.id)}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${deliveryMode === opt.id
                                                        ? "border-orange-500 bg-orange-50 text-orange-700"
                                                        : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                                        }`}
                                                >
                                                    <div className="mb-1">{opt.icon}</div>
                                                    <span className="text-xs font-bold">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <span className="bg-slate-100 p-1.5 rounded-full"><CreditCardIcon /></span>
                                            Payment
                                        </h3>
                                        <div className="space-y-2">
                                            {[
                                                { id: "online", label: " Online", icon: <CreditCardIcon />, sub: "GPay, Cards" },
                                                { id: "cod", label: "Cash on Delivery", icon: <CashIcon />, sub: "Pay on arrival" },
                                            ].map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setPaymentMethod(m.id)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${paymentMethod === m.id
                                                        ? "border-orange-500 bg-orange-50 text-orange-700"
                                                        : "border-slate-100 bg-white hover:border-slate-200"
                                                        }`}
                                                >
                                                    <div className={`p-1.5 rounded-full ${paymentMethod === m.id ? "bg-white text-orange-600 shadow-sm" : "bg-slate-100 text-slate-400"}`}>
                                                        {m.icon}
                                                    </div>
                                                    <div className="text-left flex-1 min-w-0">
                                                        <p className="font-bold text-xs truncate">{m.label}</p>
                                                        <p className="text-[10px] text-slate-400 truncate">{m.sub}</p>
                                                    </div>
                                                    {paymentMethod === m.id && (
                                                        <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* --- INVOICE VIEW --- */
                        <div className="p-6 space-y-6 animate-in slide-in-from-right fade-in duration-300">
                            {/* Bill Header */}
                            <div className="bg-slate-900 rounded-3xl p-6 text-white text-center shadow-lg shadow-slate-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6v15m7.5-7.5h-15" /></svg>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight mb-1">₹{total.toFixed(2)}</h3>
                                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest">Total to Pay</p>
                            </div>

                            {/* Item Summary (Simplified) */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-50 pb-2">Items</h4>
                                <div className="space-y-3">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start text-sm">
                                            <div className="flex gap-3">
                                                <div className="bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <p className="text-slate-800 font-medium leading-tight">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400">{item.variantLabel} {item.addons.length > 0 && `+ ${item.addons.length} addons`}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-slate-900">{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery & Payment Details */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Deliver To</p>
                                    <p className="text-xs font-bold text-slate-800 line-clamp-2">
                                        {deliveryMode === 'pickup' ? "Self Pickup" : defaultAddress?.addressLine || "Select Address"}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Method</p>
                                    <p className="text-xs font-bold text-slate-800 uppercase">
                                        {paymentMethod === 'online' ? "UPI / Online" : "Cash on Delivery"}
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Bill breakdown */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Item Total</span>
                                    <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-bold text-slate-800"}>
                                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Platform Fee</span>
                                    <span className="font-bold text-slate-800">₹0.00</span>
                                </div>
                                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center bg-orange-50 -mx-5 -mb-5 p-5 rounded-b-3xl mt-2">
                                    <span className="font-bold text-orange-900">Grand Total</span>
                                    <span className="text-xl font-black text-orange-600">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 bg-white border-t border-slate-100 space-y-4 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] z-20 shrink-0 pb-8">
                        {view === 'cart' && (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Item Total</span>
                                    <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-medium text-slate-900"}>
                                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t border-dashed border-slate-200">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={view === 'cart' ? handleProceed : handleConfirmOrder}
                            disabled={isCheckingOut}
                            className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${isCheckingOut
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-slate-900 text-white hover:bg-orange-600 hover:shadow-orange-500/30'
                                }`}
                        >
                            {isCheckingOut ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    {view === 'cart' ? (
                                        <>Proceed to Checkout <ArrowRightIcon /></>
                                    ) : (
                                        <>
                                            {paymentMethod === 'cod' ? "Place Order" : "Pay Online"}
                                            <span className="ml-1"> ₹{total.toFixed(2)}</span> <ArrowRightIcon />
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


