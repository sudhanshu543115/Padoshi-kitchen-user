"use client";

import { useState, useEffect } from "react";
import api from "@/api/axios";
import { getSocket } from "@/lib/socket";

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
    const isTerminal = currentStatus === "CANCELLED" || currentStatus === "REJECTED" || currentStatus === "DELIVERED";

    if (currentStatus === "CANCELLED" || currentStatus === "REJECTED") return null;

    return (
        <div className="flex items-center justify-between w-full mt-4 mb-8 px-2">
            {statusSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex || currentStatus === "DELIVERED";
                const isActive = index === currentStepIndex && currentStatus !== "DELIVERED";

                return (
                    <div key={step} className="flex flex-1 items-center last:flex-none">
                        {/* Circle Indicator */}
                        <div className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-500 z-10
                            ${isCompleted ? 'bg-green-600 border-green-600 text-white' :
                                isActive ? 'bg-orange-600 border-orange-600 text-white animate-pulse' :
                                    'bg-white border-gray-200 text-gray-300'}`}>
                            {isCompleted ? (
                                <span className="text-[10px]">✓</span>
                            ) : (
                                <span className="text-[10px] font-black">{index + 1}</span>
                            )}

                            {/* Label */}
                            <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors
                                ${isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                {step}
                            </span>
                        </div>

                        {/* Connection Line */}
                        {index < statusSteps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-0 -translate-x-1 transition-all duration-500
                                ${isCompleted ? 'bg-green-600' : 'bg-gray-100'}`} />
                        )}
                    </div>
                );
            })}
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

        // Safety check if socket isn't initialized yet
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
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-end">

            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {type === "active" ? "My Orders" : "Order History"}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {loading ? "Checking status..." : `${orders.length} orders found`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
                    >                        <span className="text-2xl">✕</span>
                    </button>
                </div>


                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <span className="text-6xl">📋</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">No {type} orders</h3>
                                <p className="text-sm text-gray-500 mt-1">Try ordering something delicious!</p>
                            </div>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 transition-transform hover:scale-[1.01] duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Order ID</p>
                                        <p className="text-xs font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Date</p>
                                        <p className="text-xs font-bold text-gray-900">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 py-3 border-y border-gray-50">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-orange-600">{item.quantity}x</span>
                                                    <span className="font-bold text-gray-800">{item.name}</span>
                                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded uppercase font-black text-gray-500">{item.variant.label}</span>
                                                </div>
                                                <span className="font-black text-gray-900">₹{item.itemTotal}</span>
                                            </div>
                                            {/* @ts-ignore - addons might not be in the initial simplified interface but present in data */}
                                            {item.addons && item.addons.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pl-7">
                                                    {/* @ts-ignore */}
                                                    {item.addons.map((addon: any, aIdx: number) => (
                                                        <span key={aIdx} className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                            +{addon.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {order.cancellationReason && (
                                    <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                                        <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">Reason for Cancellation</p>
                                        <p className="text-[11px] font-medium text-red-800 leading-snug mt-0.5 italic">
                                            "{order.cancellationReason}"
                                        </p>
                                    </div>
                                )}

                                <OrderStepper currentStatus={order.status} />

                                <div className="flex justify-between items-center">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${order.status === "PLACED" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                            order.status === "DELIVERED" || order.status === "ACCEPTED" || order.status === "READY" || order.status === "PICKED_UP" ? "bg-green-50 text-green-600 border border-green-100" :
                                                order.status === "CANCELLED" || order.status === "REJECTED" ? "bg-red-50 text-red-600 border border-red-100" :
                                                    "bg-orange-50 text-orange-600 border border-orange-100"
                                            }`}>
                                            {order.status}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${order.payment.status === "PAID" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                            } border border-opacity-20`}>
                                            {order.payment.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</p>
                                        <p className="text-lg font-black text-gray-900">₹{order.pricing.grandTotal}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div >
        </div >
    );
}
