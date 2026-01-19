"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/", "/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Run on client side only
        const token = localStorage.getItem("accessToken");
        const isPublicPath = PUBLIC_PATHS.includes(pathname);

        if (!token && !isPublicPath) {
            router.push("/login");
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    // Show nothing or a loading spinner while checking auth
    // to prevent flashing of protected content
    if (!authorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verifying Access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
