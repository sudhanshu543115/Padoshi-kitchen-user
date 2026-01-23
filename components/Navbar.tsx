import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import ProfileModal from "@/components/ProfileModal";
import CartModal from "@/components/CartModal";
import OrdersModal from "@/components/OrdersModal";

// --- Reusable Icon Component ---
const Icon = ({ path, className = "w-5 h-5" }: { path: string; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  cart: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125",
  orders: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  history: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  logout: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
};

export default function Navbar() {
  const { user } = useUser();
  const { totalItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openProfile, setOpenProfile] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);
  const [ordersType, setOrdersType] = useState<"active" | "history">("active");
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchParams.get("openCart") === "true") {
      setOpenCart(true);
      // Optional: Clear params or let it be
    }
  }, [searchParams]);

  const handleLogout = () => {
    setShowDropdown(false);
    // Add any context/auth cleanup logic here if needed
    router.push("/login");
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    setModalMode("view");
    setOpenProfile(true);
  };

  const handleUpdateProfile = () => {
    setShowDropdown(false);
    setModalMode("edit");
    setOpenProfile(true);
  };

  const handleOpenOrders = (type: "active" | "history") => {
    setShowDropdown(false);
    setOrdersType(type);
    setOpenOrders(true);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo Section */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/home")}
          >
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
              Padoshi Kitchen
            </span>
          </div>

          {/* Right Actions Section */}
          <div className="flex items-center gap-6">

            {/* Cart Button */}
            <button
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 group"
              onClick={() => setOpenCart(true)}
              aria-label="Open Cart"
            >
              <Icon path={ICONS.cart} className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Profile Dropdown Container */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center focus:outline-none"
              >
                <div className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-200 ${showDropdown ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-400"
                  }`}>
                  <Image
                    src="/avatar.png"
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  {/* FIX: Increased z-index to 45 so it covers the navbar (z-40) but stays under the menu (z-50) */}
                  <div
                    className="fixed inset-0 z-[45] cursor-default"
                    onClick={() => setShowDropdown(false)}
                  />

                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right overflow-hidden">

                    {/* User Header */}
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user?.mobile || "User"}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleViewProfile}
                        className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                      >
                        <Icon path={ICONS.user} /> View Profile
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                      >
                        <Icon path={ICONS.edit} /> Update Profile
                      </button>
                      <button
                        onClick={() => handleOpenOrders("active")}
                        className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                      >
                        <Icon path={ICONS.orders} /> My Orders
                      </button>
                      <button
                        onClick={() => handleOpenOrders("history")}
                        className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                      >
                        <Icon path={ICONS.history} /> Order History
                      </button>
                    </div>

                    <div className="h-px bg-gray-100 mx-5 my-1"></div>

                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                      >
                        <Icon path={ICONS.logout} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {openProfile && (
        <ProfileModal
          mode={modalMode}
          onClose={() => setOpenProfile(false)}
        />
      )}

      {openCart && (
        <CartModal
          onClose={() => {
            setOpenCart(false);
            // Optional: Remove query param from URL on close
            const url = new URL(window.location.href);
            if (url.searchParams.has("openCart")) {
              url.searchParams.delete("openCart");
              window.history.replaceState({}, "", url.toString());
            }
          }}
        />
      )}

      {openOrders && (
        <OrdersModal
          type={ordersType}
          onClose={() => setOpenOrders(false)}
        />
      )}
    </nav>
  );
}