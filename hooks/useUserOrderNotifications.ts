import { useEffect } from "react";
import { getUserSocket } from "@/lib/socket";

interface OrderNotificationProps {
    onPlaced?: (order: any) => void;
    onAccepted?: (order: any) => void;
    onPreparing?: (order: any) => void;
    onReady?: (order: any) => void;
    onPicked?: (order: any) => void;
    onDelivered?: (order: any) => void;
}

export const useUserOrderNotifications = ({
    onPlaced,
    onAccepted,
    onPreparing,
    onReady,
    onPicked,
    onDelivered,
}: OrderNotificationProps) => {
    useEffect(() => {
        const socket = getUserSocket();
        if (!socket) return;

        const handleOrderUpdate = (data: { orderId: string; status: string; updatedAt: string }) => {
            switch (data.status) {
                case "PLACED":
                    onPlaced?.(data);
                    break;
                case "ACCEPTED":
                    onAccepted?.(data);
                    break;
                case "PREPARING":
                    onPreparing?.(data);
                    break;
                case "READY":
                    onReady?.(data);
                    break;
                case "PICKED_UP":
                    onPicked?.(data);
                    break;
                case "DELIVERED":
                    onDelivered?.(data);
                    break;
                default:
                    break;
            }
        };

        socket.on("order:update", handleOrderUpdate);

        return () => {
            socket.off("order:update", handleOrderUpdate);
        };
    }, [onPlaced, onAccepted, onPreparing, onReady, onPicked, onDelivered]);
};
