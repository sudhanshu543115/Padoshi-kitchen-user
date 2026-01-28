"use client";

import { useState, use, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import api from "@/api/axios";
import CartModal from "@/components/CartModal";

// --- Icons Components for cleaner JSX ---
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/80">
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clipRule="evenodd" />
  </svg>
);

const VegIcon = () => (
  <div className="w-4 h-4 border border-green-600 p-[2px] flex items-center justify-center bg-white rounded-[2px]">
    <div className="w-2 h-2 rounded-full bg-green-600"></div>
  </div>
);

const NonVegIcon = () => (
  <div className="w-4 h-4 border border-red-600 p-[2px] flex items-center justify-center bg-white rounded-[2px]">
    <div className="w-2 h-2 rounded-full bg-red-600"></div>
  </div>
);

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter(); 
  const { id } = use(params);
  const { addToCart, totalItems } = useCart();
  const [openCart, setOpenCart] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [itemCustomizations, setItemCustomizations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateCustomization = (itemId: string, field: string, value: any) => {
    setItemCustomizations(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { spiceLevel: "Medium", isJain: false, notes: "", addons: [] }),    
        [field]: value
      } 
    }));
  };

  const toggleAddon = (itemId: string, addon: any) => {
    const current = itemCustomizations[itemId]?.addons || [];
    const exists = current.find((a: any) => a.name === addon.name);
    const next = exists
      ? current.filter((a: any) => a.name !== addon.name)
      : [...current, { name: addon.name, price: addon.price }];

    updateCustomization(itemId, 'addons', next);
  };

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`user/kitchens/${id}/menu`);
      if (response.data.success) {
        const kitchen = response.data.kitchen;

        setRestaurant({
          id: kitchen.id,
          name: kitchen.name || "Home Kitchen",
          rating: kitchen.rating || 4.5,
          society: kitchen.societyName || "Nearby",
          img: kitchen.images?.[0] || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format",
          category: kitchen.cuisineType?.[0] || "Home Food",
          isOnline: kitchen.isOnline
        });

        const fetchedCategories = response.data.categories || [];
        const fetchedItems = response.data.items || [];

        setCategories(fetchedCategories);
        setItems(fetchedItems);

        if (fetchedCategories.length > 0) {
          setActiveCategory(fetchedCategories[0]._id);
        }

        const defaults: Record<string, string> = {};
        fetchedItems.forEach((item: any) => {
          const defaultVariant = item.variants?.find((v: any) => v.isDefault) || item.variants?.[0];
          if (defaultVariant) {
            defaults[item._id] = defaultVariant._id;
          }
        });
        setSelectedVariants(defaults);
      }
    } catch (err: any) {
      console.error("Failed to fetch menu:", err);
      setError(err.response?.data?.message || "Failed to load menu. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleAddToCart = async (item: any) => {
    const variantId = selectedVariants[item._id];
    const selectedVariant = item.variants?.find((v: any) => v._id === variantId);
    const customization = itemCustomizations[item._id] || { spiceLevel: "Medium", isJain: false, notes: "", addons: [] };

    await addToCart({
      id: selectedVariant ? `${item._id}-${variantId}` : item._id,
      kitchenId: id,
      menuItemId: item._id,
      name: item.name,
      variantLabel: selectedVariant?.label || "Regular",
      price: `₹${selectedVariant ? selectedVariant.price : item.price}`,
      img: item.imageUrl || "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400&auto=format",
      addons: customization.addons,
      customization: {
        spiceLevel: customization.spiceLevel,
        isJain: customization.isJain,
        notes: customization.notes
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          {/* Custom Skeleton Loader Style */}
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium mt-6 animate-pulse">Preparing the kitchen...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Oops!</h1>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">{error || "We couldn't find that kitchen."}</p>
          <button onClick={() => router.push("/discover")} className="w-full bg-slate-900 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-orange-600 transition-all transform hover:-translate-y-1 shadow-lg">
            Back to Discover
          </button>
          <button onClick={fetchMenu} className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  const currentCategoryData = categories.find((c: any) => c._id === activeCategory);

  let filteredItems = items.filter(item => {
    if (item.categoryId === activeCategory) return true;
    if (item.category === activeCategory) return true;
    if (item.category === currentCategoryData?.name) return true;
    if (typeof item.category === "object") {
      if (item.category?._id === activeCategory) return true;
      if (item.category?.name === currentCategoryData?.name) return true;
    }
    return false;
  });

  if (filteredItems.length === 0 && items.length > 0 && categories.length === 1) {
    filteredItems = items;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden group">
        <Image
          src={restaurant.img}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-[20s] group-hover:scale-110"
          priority
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 py-10 w-full text-white">

            {/* Online Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md border ${restaurant.isOnline ? "bg-green-500/20 border-green-500/30 text-green-300" : "bg-red-500/20 border-red-500/30 text-red-300"}`}>
              <span className={`w-2 h-2 rounded-full ${restaurant.isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></span>
              {restaurant.isOnline ? "Accepting Orders" : "Currently Closed"}
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2 text-white shadow-sm">{restaurant.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <StarIcon /> {restaurant.rating}
              </div>
              <div className="flex items-center gap-1.5 px-2">
                <span className="w-1 h-1 rounded-full bg-white/60"></span>
                <span className="uppercase tracking-wider text-xs">{restaurant.category}</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
                <LocationIcon /> {restaurant.society}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-6 relative z-10">

        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Categories</h3>
              <p className="text-xs text-slate-400 mt-1">Explore the menu</p>
            </div>
            <div className="p-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {categories.map((cat: any) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all duration-200 ${activeCategory === cat._id
                      ? "bg-slate-900 text-white shadow-md transform scale-[1.02]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-orange-600"
                    }`}
                >
                  <span className="font-medium text-sm truncate">{cat.name}</span>
                  {activeCategory === cat._id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Menu Items Area */}
        <div className="lg:col-span-9 space-y-8">

          {/* Category Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{currentCategoryData?.name || "Menu"}</h2>
              <p className="text-slate-500 text-sm mt-1">{currentCategoryData?.description || "Freshly prepared for you."}</p>
            </div>
            <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
              {filteredItems.length} Items
            </span>
          </div>

          <div className="grid gap-6">
            {filteredItems.map((item: any) => {
              const selectedTokenId = selectedVariants[item._id];
              const currentVariant = item.variants?.find((v: any) => v._id === selectedTokenId);
              const basePrice = currentVariant ? currentVariant.price : (item.variants?.[0]?.price || 0);
              const selectedAddons = itemCustomizations[item._id]?.addons || [];
              const addonsPrice = selectedAddons.reduce((sum: number, a: any) => sum + (a.price || 0), 0);
              const finalPrice = basePrice + addonsPrice;

              return (
                <div key={item._id} className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 transition-all duration-300 flex flex-col sm:flex-row gap-6 relative overflow-hidden">

                  {/* Image Section */}
                  <div className="relative h-48 sm:h-auto sm:w-48 rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={item.imageUrl || "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400&auto=format"}
                      alt={item.name}
                      fill
                      className={`object-cover transition-transform duration-700 group-hover:scale-110 ${!restaurant.isOnline ? "grayscale" : ""}`}
                      unoptimized
                    />
                    {/* Tag Overlay */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-sm z-10">
                      {item.foodType === "VEG" ? <VegIcon /> : <NonVegIcon />}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors pr-4">{item.name}</h3>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-slate-900">₹{finalPrice}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{item.description}</p>

                    {/* Features Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.customization?.jainAvailable && (
                        <span className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md font-bold uppercase tracking-wider border border-green-100">Jain Option</span>
                      )}
                      {item.customization?.spiceLevel && (
                        <span className="text-[10px] px-2 py-1 bg-orange-50 text-orange-700 rounded-md font-bold uppercase tracking-wider border border-orange-100">Spice Level</span>
                      )}
                      {currentVariant?.servingSize && (
                        <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-md font-bold uppercase tracking-wider">
                          {currentVariant.servingSize}
                        </span>
                      )}
                    </div>

                    {/* Variants & Controls - Pushed to bottom */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      {/* Variant Selector */}
                      <div className="flex flex-wrap gap-2">
                        {item.variants?.length > 1 && item.variants.map((v: any) => (
                          <button
                            key={v._id}
                            onClick={() => setSelectedVariants({ ...selectedVariants, [item._id]: v._id })}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${selectedVariants[item._id] === v._id
                                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                              }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!restaurant.isOnline}
                        className={`
                          px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2
                          ${restaurant.isOnline
                            ? "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-200 hover:-translate-y-0.5"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          }
                        `}
                      >
                        {restaurant.isOnline ? (
                          <>
                            Add <span className="text-lg leading-none mb-0.5">+</span>
                          </>
                        ) : "Unavailable"}
                      </button>
                    </div>

                    {/* Addons Section (Interactive) */}
                    {item.addons?.length > 0 && (
                      <div className="mt-3 pt-2">
                        <details className="group/addons" open>
                          <summary className="text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer hover:text-orange-500 transition-colors list-none flex items-center gap-1">
                            Available Add-ons <span className="group-open/addons:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="flex flex-wrap gap-2 mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                            {item.addons.map((addon: any) => {
                              const isSelected = selectedAddons.some((a: any) => a.name === addon.name);
                              return (
                                <button
                                  key={addon._id}
                                  onClick={() => toggleAddon(item._id, addon)}
                                  className={`text-xs px-2 py-1 rounded border transition-all ${isSelected
                                      ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                                      : "bg-slate-50 border-slate-100 text-slate-600 hover:border-orange-200"
                                    }`}
                                >
                                  {addon.name} <span className="font-semibold text-inherit">+₹{addon.price}</span>
                                  {isSelected && <span className="ml-1">✓</span>}
                                </button>
                              )
                            })}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-bold text-slate-800">Menu Empty</h3>
                <p className="text-slate-400">There are no items in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Cart Bar - Premium Style */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl text-white pl-4 pr-2 py-2 rounded-2xl shadow-2xl shadow-slate-900/30 flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-500 border border-white/10 max-w-md w-full justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 text-white font-bold w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-orange-500/30">
                {totalItems}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Items</span>
                <span className="font-bold text-sm">Ready to checkout</span>
              </div>
            </div>

            <button
              onClick={() => setOpenCart(true)}
              className="bg-white text-slate-900 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              View Cart <span>→</span>
            </button>
          </div>
        </div>
      )}

      {openCart && (
        <CartModal
          onClose={() => setOpenCart(false)}
        />
      )}
    </div>
  );
}































