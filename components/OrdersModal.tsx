"use client";

import { useState, useEffect } from "react";
import api from "@/api/axios";
import { getSocket } from "@/lib/socket";

// --- Icons ---
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const HashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>);

interface OrderItem {
    name: string;
    quantity: number;
    itemTotal: number;
    variant: {
        label: string;
        price: number;
    };
}

interface Order {
    _id: string;
    status: string;
    createdAt: string;
    pricing: {
        grandTotal: number;
    };
    items: OrderItem[];
    payment: {
        status: string;
    };
    cancellationReason?: string;
}

interface OrdersModalProps {
    type: "active" | "history";
    onClose: () => void;
}

const statusSteps = ["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "DELIVERED"];

function OrderStepper({ currentStatus }: { currentStatus: string }) {
    const currentStepIndex = statusSteps.indexOf(currentStatus);
    // If status is cancelled or rejected, we handle it outside this stepper usually, 
    // but the logic here hides it which is fine.
    if (currentStatus === "CANCELLED" || currentStatus === "REJECTED") return null;

    return (
        <div className="w-full mt-5 mb-2 px-1">
            <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10" />

                {statusSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex || currentStatus === "DELIVERED";
                    const isActive = index === currentStepIndex && currentStatus !== "DELIVERED";
                    const isUpcoming = index > currentStepIndex;

                    return (
                        <div key={step} className="flex flex-col items-center group">
                            {/* Circle Indicator */}
                            <div className={`relative flex items-center justify-center w-5 h-5 rounded-full border-[1.5px] transition-all duration-300 bg-white
                                ${isCompleted 
                                    ? 'border-green-500 bg-green-500 text-white' 
                                    : isActive 
                                        ? 'border-orange-500 text-orange-500 scale-110 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]' 
                                        : 'border-slate-200 text-slate-200'
                                }`}
                            >
                                {isCompleted && <CheckIcon />}
                                {isActive && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                            </div>

                            {/* Label */}
                            <span className={`absolute -bottom-5 text-[8px] font-bold uppercase tracking-wide mt-1.5 transition-colors whitespace-nowrap
                                ${isActive ? 'text-orange-600 opacity-100' : isCompleted ? 'text-green-600 opacity-80' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}
                                style={{ transform: 'translateX(0)' }} 
                            >
                                {step.replace("_", " ")}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Active Label Spacer */}
            <div className="h-4"></div> 
        </div>
    );
}

export default function OrdersModal({ type, onClose }: OrdersModalProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const endpoint = type === "active" ? "user/orders/active" : "user/orders/history";
                const response = await api.get(endpoint);
                if (response.data.success) {
                    setOrders(response.data.orders);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [type]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        if (!socket.connected) {
            socket.connect();
        }

        const handleOrderUpdate = (data: { orderId: string; status: string; updatedAt: string }) => {
            console.log("⚡ [OrdersModal] Order Update:", data);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === data.orderId
                        ? { ...order, status: data.status }
                        : order
                )
            );
        };

        socket.on("order:update", handleOrderUpdate);

        return () => {
            socket.off("order:update", handleOrderUpdate);
        };
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-lg h-[100dvh] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-white/10">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-xl sticky top-0 z-10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {type === "active" ? "Active Orders" : "Order History"}
                        </h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">
                            {loading ? "Syncing..." : `${orders.length} ${orders.length === 1 ? 'Order' : 'Orders'} found`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scrollbar-hide">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md text-5xl grayscale">
                                🧾
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {type === "active" ? "You have no active orders." : "You haven't placed any orders yet."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div 
                                key={order._id} 
                                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:border-slate-200 group"
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start pb-4 border-b border-slate-50">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            <HashIcon /> Order ID
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            <ClockIcon /> Date
                                        </div>
                                        <p className="text-xs font-bold text-slate-700">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="py-4 space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-black text-orange-600 text-xs">{item.quantity}x</span>
                                                    <span className="font-bold text-slate-800">{item.name}</span>
                                                </div>
                                                <div className="pl-6 flex flex-wrap gap-2 mt-1">
                                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wide">
                                                        {item.variant.label}
                                                    </span>
                                                    {/* @ts-ignore */}
                                                    {item.addons?.map((addon: any, aIdx: number) => (
                                                        <span key={aIdx} className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border border-orange-100">
                                                            + {addon.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="font-bold text-slate-900 tabular-nums">₹{item.itemTotal}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Cancellation Reason */}
                                {order.cancellationReason && (
                                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-3">
                                        <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">Reason for Cancellation</p>
                                        <p className="text-xs font-medium text-red-800 italic">
                                            "{order.cancellationReason}"
                                        </p>
                                    </div>
                                )}

                                {/* Stepper */}
                                <OrderStepper currentStatus={order.status} />

                                {/* Card Footer */}
                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center mt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {/* Status Badge */}
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5
                                            ${order.status === "PLACED" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                              (order.status === "DELIVERED" || order.status === "ACCEPTED" || order.status === "READY" || order.status === "PICKED_UP") ? "bg-green-50 text-green-600 border-green-100" :
                                              (order.status === "CANCELLED" || order.status === "REJECTED") ? "bg-red-50 text-red-600 border-red-100" :
                                              "bg-orange-50 text-orange-600 border-orange-100"
                                            }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                order.status === "DELIVERED" ? "bg-green-500" : 
                                                (order.status === "CANCELLED" || order.status === "REJECTED") ? "bg-red-500" :
                                                "bg-current animate-pulse"
                                            }`} />
                                            {order.status}
                                        </span>

                                        {/* Payment Badge */}
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border
                                            ${order.payment.status === "PAID" ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                            }`}
                                        >
                                            {order.payment.status}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total</p>
                                        <p className="text-xl font-black text-slate-900 tabular-nums">₹{order.pricing.grandTotal}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}