"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import api from "@/api/axios";
import { useRouter } from "next/navigation";

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
        router.push(`/orders/${res.data.orderId}`);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-8">
          Delivery Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-8">
            {/* ADDRESS */}
            {deliveryMode !== "pickup" && (
              <div className="bg-white p-6 rounded-2xl border">
                <h2 className="font-bold mb-4">Delivery Address</h2>

                {loading ? (
                  <div className="h-16 bg-gray-100 animate-pulse rounded" />
                ) : defaultAddress ? (
                  <div className="p-4 bg-orange-50 border rounded">
                    <p className="font-bold">{defaultAddress.addressLine}</p>
                    <p className="text-sm text-gray-600">
                      {defaultAddress.societyName}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push("/checkout/address")}
                    className="text-orange-600 font-bold"
                  >
                    Add Address
                  </button>
                )}
              </div>
            )}

            {/* DELIVERY MODE */}
            <div className="bg-white p-6 rounded-2xl border">
              <h2 className="font-bold mb-4">Delivery Option</h2>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "platform", label: "Platform Rider" },
                  { id: "own", label: "Own Ride" },
                  { id: "pickup", label: "Self Pickup" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDeliveryMode(opt.id)}
                    className={`p-4 border rounded ${
                      deliveryMode === opt.id
                        ? "border-orange-500 bg-orange-50"
                        : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PAYMENT */}
            <div className="bg-white p-6 rounded-2xl border">
              <h2 className="font-bold mb-4">Payment Method</h2>

              {["upi", "cod"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`block w-full p-3 mb-2 border rounded ${
                    paymentMethod === m
                      ? "border-orange-500 bg-orange-50"
                      : ""
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="bg-white p-6 rounded-2xl border sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>

              <div className="flex justify-between">
                <span>Items</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
              </div>

              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  isPlacingOrder ||
                  (deliveryMode !== "pickup" && !defaultAddress)
                }
                className="w-full mt-4 py-3 bg-gray-900 text-white rounded disabled:bg-gray-400"
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
