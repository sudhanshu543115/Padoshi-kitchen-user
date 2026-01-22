"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import api from "@/api/axios";
import { useRouter } from "next/navigation";

// --- Icons ---
const MapPinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>);
const BikeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>); // Using bolt for fast delivery
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const StoreIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>);
const CreditCardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>);
const CashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>);
const ChevronRight = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>);


export default function DeliveryDetailsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { cart } = useCart();

  /* -------------------- STATE -------------------- */
  const [deliveryMode, setDeliveryMode] = useState("platform"); // platform | own | pickup
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi | cod
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  /* -------------------- DELIVERY MODE MAP -------------------- */
  const deliveryModeMap: Record<string, string> = {
    platform: "PADOSHI_DELIVERY",
    pickup: "SELF_PICKUP",
    own: "THIRD_PARTY",
  };

  /* -------------------- TOTAL CALCULATION -------------------- */
  const subtotal = cart.reduce((sum: number, item: any) => {
    const itemPrice = parseFloat(item.price.replace("₹", ""));
    const addonsPrice = item.addons.reduce(
      (aSum: number, a: any) => aSum + (a.price || 0),
      0
    );
    return sum + (itemPrice + addonsPrice) * item.quantity;
  }, 0);

  const deliveryFee = deliveryMode === "platform" ? 40 : 0;
  const total = subtotal + deliveryFee;

  /* -------------------- FETCH ADDRESSES -------------------- */
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get("user/auth/address");
        if (res.data.success) {
          setAddresses(res.data.addresses);
          const def = res.data.addresses.find((a: any) => a.isDefault);
          setDefaultAddress(def || res.data.addresses[0] || null);
        }
      } catch (err) {
        console.error("Address fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  /* -------------------- PLACE ORDER -------------------- */
  const handlePlaceOrder = async () => {
    if (!cart.length) {
      alert("Your cart is empty");
      return;
    }

    if (deliveryMode !== "pickup" && !defaultAddress) {
      alert("Please select a delivery address");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const payload: any = {
        delivery: {
          mode: deliveryModeMap[deliveryMode],
        },
        payment: {
          method: paymentMethod === "cod" ? "COD" : "ONLINE",
        },
      };

      // Address required only for delivery
      if (deliveryMode !== "pickup") {
        payload.delivery.addressId = defaultAddress._id;
      }

      const res = await api.post("user/cart/checkout", payload);

      if (res.data.success) {
        router.push('/discover');
      } else {
        alert(res.data.message || "Checkout failed");
      }
    } catch (err: any) {
      console.error("Checkout error", err);
      alert(err?.response?.data?.message || "Checkout failed");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-slate-500 mt-1">Review your details and complete the order.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Options */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. DELIVERY ADDRESS (Conditional) */}
            {deliveryMode !== "pickup" && (
              <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
                <div className="flex justify-between items-center mb-4 pl-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-slate-100 p-1.5 rounded-full"><MapPinIcon /></span> 
                        Delivery Address
                    </h2>
                    <button 
                        onClick={() => router.push("/checkout/address")} 
                        className="text-orange-600 text-sm font-bold hover:underline"
                    >
                        {defaultAddress ? "Change" : "+ Add"}
                    </button>
                </div>

                <div className="pl-4">
                    {loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    </div>
                    ) : defaultAddress ? (
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex gap-4 items-start">
                        <div className="bg-white p-2 rounded-full text-orange-600 shadow-sm">
                            <MapPinIcon />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-orange-100 text-orange-600">
                                    {defaultAddress.label || "Home"}
                                </span>
                            </div>
                            <p className="font-bold text-slate-800 leading-tight">{defaultAddress.addressLine}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{defaultAddress.societyName}</p>
                        </div>
                    </div>
                    ) : (
                    <button
                        onClick={() => router.push("/checkout/address")}
                        className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-orange-400 hover:text-orange-600 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                        <MapPinIcon />
                        Add a delivery address
                    </button>
                    )}
                </div>
              </section>
            )}

            {/* 2. DELIVERY OPTION */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 pl-4 flex items-center gap-2">
                    <span className="bg-slate-100 p-1.5 rounded-full"><BikeIcon /></span>
                    Delivery Method
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-4">
                    {[
                        { id: "platform", label: "Kitchen Rider", icon: <BikeIcon />, desc: "Fastest" },
                        { id: "own", label: "Third Party", icon: <UserIcon />, desc: "Dunzo" },
                        { id: "pickup", label: "Self Pickup", icon: <StoreIcon />, desc: "No Fee" },
                    ].map((opt) => (
                        <button
                        key={opt.id}
                        onClick={() => setDeliveryMode(opt.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                            deliveryMode === opt.id
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-slate-100 bg-slate-50/50 hover:border-orange-200 hover:bg-white"
                        }`}
                        >
                            {deliveryMode === opt.id && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                            <div className={`mb-3 ${deliveryMode === opt.id ? "text-orange-600" : "text-slate-400 group-hover:text-orange-500"}`}>
                                {opt.icon}
                            </div>
                            <div className="font-bold text-slate-800 text-sm">{opt.label}</div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* 3. PAYMENT METHOD */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 pl-4 flex items-center gap-2">
                    <span className="bg-slate-100 p-1.5 rounded-full"><CreditCardIcon /></span>
                    Payment
                </h2>

                <div className="space-y-3 pl-4">
                    {[
                        { id: "upi", label: "UPI / Online Payment", icon: <CreditCardIcon />, sub: "GPay, PhonePe, Cards" },
                        { id: "cod", label: "Cash on Delivery", icon: <CashIcon />, sub: "Pay when it arrives" },
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                paymentMethod === m.id
                                ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                                : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"
                            }`}
                        >
                            <div className={`p-2 rounded-full ${paymentMethod === m.id ? "bg-white text-orange-600 shadow-sm" : "bg-slate-100 text-slate-500"}`}>
                                {m.icon}
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-bold text-slate-800">{m.label}</p>
                                <p className="text-xs text-slate-500">{m.sub}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === m.id ? "border-orange-500" : "border-slate-300"
                            }`}>
                                {paymentMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                            </div>
                        </button>
                    ))}
                </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24 overflow-hidden">
                {/* Receipt Header */}
                <div className="bg-slate-900 px-6 py-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        Order Summary
                    </h3>
                </div>

                <div className="p-6">
                    {/* Bill Details */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Item Total</span>
                            <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Delivery Fee</span>
                            {deliveryFee === 0 ? (
                                <span className="text-green-600 font-bold">FREE</span>
                            ) : (
                                <span className="font-medium text-slate-900">₹{deliveryFee}</span>
                            )}
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Platform Fee</span>
                            <span className="font-medium text-slate-900">₹0.00</span>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="my-6 border-t-2 border-dashed border-slate-200 relative">
                        <div className="absolute -top-1.5 -left-8 w-3 h-3 bg-slate-50 rounded-full"></div>
                        <div className="absolute -top-1.5 -right-8 w-3 h-3 bg-slate-50 rounded-full"></div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-slate-800 text-lg">To Pay</span>
                        <span className="font-black text-2xl text-slate-900">₹{total.toFixed(2)}</span>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handlePlaceOrder}
                        disabled={
                        isPlacingOrder ||
                        (deliveryMode !== "pickup" && !defaultAddress)
                        }
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isPlacingOrder ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing
                            </>
                        ) : (
                            <>
                                Place Order <ChevronRight />
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-center text-slate-400 mt-4 px-4 leading-tight">
                        By placing an order, you agree to Padoshi Kitchen's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}