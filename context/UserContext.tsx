"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
    user: {
        fullName: string;
        address: string;
        societyName: string;
        geoLocation: { coordinates: number[] };
    };
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState({
        fullName: "Sudhanshu Dubey",
        address: "8th Floor , Tower C , BHutani Alphathum",
        societyName: "Sector 62 Noida",
        geoLocation: { coordinates: [77.3649, 28.6289] },
    });

    return (
        <UserContext.Provider value={{ user, setUser }}>
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
