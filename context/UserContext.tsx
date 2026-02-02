"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import api from "@/api/axios";

export interface UserContextType {
    user: {
        id: string;
        fullName: string;
        address: string;
        societyName: string;
        mobile: string;
        geoLocation: { coordinates: number[] };
        role: string;
        profileCompleted: boolean;
    };
    setUser: React.Dispatch<React.SetStateAction<any>>;
    fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState({
        id: "",
        fullName: "",
        address: "",
        societyName: "",
        mobile: "",
        geoLocation: { coordinates: [0, 0] },
        role: "",
        profileCompleted: false,
    });

    const fetchUserProfile = useCallback(async () => {
        console.log("Fetching user profile...");
        try {
            const response = await api.get("user/profile/me");
            console.log("API Response:", response.data);
            if (response.data.success) {
                const userData = response.data.user;
                console.log("User Data:", userData);
                // Clear empty state and set real API data
                setUser({
                    id: userData.id || "",
                    fullName: userData.fullName || "",
                    address: userData.defaultAddress.addressLine || "",
                    societyName: userData.defaultAddress.societyName || "",
                    mobile: userData.mobile || "",
                    geoLocation: userData.defaultAddress.geoLocation || { coordinates: [0, 0] },
                    role: userData.role || "",
                    profileCompleted: userData.profileCompleted || false,
                });
                console.log("User state updated successfully");
            } else {
                console.log("API returned success: false");
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    }, []);

    useEffect(() => {
        // Auto-fetch user profile when component mounts
        // Add small delay to ensure token is properly set
        const timer = setTimeout(() => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                console.log("Token found, fetching user profile...");
                fetchUserProfile();
            } else {
                console.log("No token found, user not logged in");
            }
        }, 100); // 100ms delay

        return () => clearTimeout(timer);
    }, []);

    // Also listen for token changes (for login/logout)
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                console.log("Token detected, fetching user profile...");
                fetchUserProfile();
            } else {
                console.log("Token removed, clearing user data...");
                // Clear user data when logged out
                setUser({
                    id: "",
                    fullName: "",
                    address: "",
                    societyName: "",
                    mobile: "",
                    geoLocation: { coordinates: [0, 0] },
                    role: "",
                    profileCompleted: false,
                });
            }
        };

        // Listen for storage changes
        window.addEventListener('storage', handleStorageChange);

        // Only check periodically if we don't have user data but have a token
        const interval = setInterval(() => {
            const currentToken = localStorage.getItem('accessToken');
            if (currentToken && !user.id) {
                console.log("Token found but no user data, fetching...");
                fetchUserProfile();
            }
        }, 3000); // Check every 3 seconds (slower)

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [user.id]);

    return (
        <UserContext.Provider value={{ user, setUser, fetchUserProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
