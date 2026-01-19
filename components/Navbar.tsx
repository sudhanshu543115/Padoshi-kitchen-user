import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import ProfileModal from "@/components/ProfileModal";
import CartModal from "@/components/CartModal";
import OrdersModal from "@/components/OrdersModal";

export default function Navbar() {
  const { user, setUser } = useUser();
  const { totalItems } = useCart();
  const router = useRouter();
  const [openProfile, setOpenProfile] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);
  const [ordersType, setOrdersType] = useState<"active" | "history">("active");
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    console.log("Logging out...");
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
    <nav className="bg-blue-600 text-white flex justify-between items-center px-6 py-3 relative">
      <div className="flex items-center gap-2 " onClick={() => router.push("/home")}>
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
        <span className="font-bold text-xl">
          Padoshi Kitchen
        </span>

      </div>
      <div className="flex items-center gap-6">
        <button
          className="relative p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer group"
          onClick={() => setOpenCart(true)}
        >
          <span className="text-2xl group-hover:scale-110 transition-transform block">🛒</span>
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-blue-600 animate-in zoom-in duration-300">
              {totalItems}
            </span>
          )}
        </button>

        <img
          src="/avatar.png"
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-white transition-all shadow-md"
          onClick={() => setShowDropdown(!showDropdown)}
        />
      </div>

      <div className="relative">
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-gray-100 mb-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Account</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{user.fullName}</p>
            </div>
            <button
              onClick={handleViewProfile}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <span className="text-lg">👤</span> View Profile
            </button>
            <button
              onClick={handleUpdateProfile}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <span className="text-lg">✏️</span> Update Profile
            </button>
            <button
              onClick={() => handleOpenOrders("active")}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <span className="text-lg">📋</span> My Orders
            </button>
            <button
              onClick={() => handleOpenOrders("history")}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <span className="text-lg">🕒</span> History
            </button>
            <div className="h-px bg-gray-100 my-1"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
            >
              <span className="text-lg">🚪</span> Logout
            </button>

          </div>
        )}
      </div>

      {openProfile && (
        <ProfileModal
          mode={modalMode}
          onClose={() => setOpenProfile(false)}
        />
      )}

      {openCart && (
        <CartModal
          onClose={() => setOpenCart(false)}
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
