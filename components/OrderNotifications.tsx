"use client";

import { useUserOrderNotifications } from "@/hooks/useUserOrderNotifications";
import toast from "react-hot-toast";

const OrderNotifications = () => {
  useUserOrderNotifications({
    onPlaced: (order) => {
      console.log("🛒 Order placed", order);
      toast.success("Order placed successfully , please check your orders ");
    },
    onAccepted: (order) => {
      console.log("✅ Order accepted", order);
      toast.success("Your order has been accepted!");
    },
    onPreparing: (order) => {
      console.log("🍳 Order preparing", order);
      toast("Your food is preparing", { icon: "🍳" });
    },
    onReady: (order) => {
      console.log("🍱 Order ready", order);
      toast.success("Order is ready for pickup/delivery!");
    },
    onPicked: (order) => {
      console.log("🍱 Order picked", order);
      toast.success("Order is picked up!");
    },
    onDelivered: (order) => {
      console.log("🚚 Order delivered", order);
      toast.success("Order delivered. Enjoy your meal!");
    },
  });

  return null;
};

export default OrderNotifications;
