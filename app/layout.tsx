import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import SocketInitializer from "@/components/SocketInitializer";
import OrderNotifications from "@/components/OrderNotifications";
import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Padoshi Kitchen",
  description: "Delicious home-cooked meals delivered to your door.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <CartProvider>
            <SocketInitializer />
            <OrderNotifications />
            <Toaster position="top-center" />
            <AuthGuard>
              {children}
            </AuthGuard>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
