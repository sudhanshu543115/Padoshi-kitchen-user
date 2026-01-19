"use client";

import { useEffect } from "react";
import { connectUserSocket, disconnectUserSocket } from "@/lib/socket";

export default function SocketInitializer() {
    useEffect(() => {
        // You might want to get the token from a secure place or context
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
        if (token) {
            connectUserSocket(token);
        }

        return () => disconnectUserSocket();
    }, []);

    return null;
}
