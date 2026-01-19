"use client";

import { useState, use, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import api from "@/api/axios";
import CartModal from "@/components/CartModal";

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
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading delicious menu...</p>
                </div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
                    <p className="text-gray-500 mb-6 text-sm">{error || "Restaurant Not Found"}</p>
                    <button onClick={() => router.push("/discover")} className="w-full text-orange-600 font-bold px-6 py-3 border-2 border-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all cursor-pointer">
                        Back to Discover
                    </button>
                    <button onClick={fetchMenu} className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Try Again</button>
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
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <Image
                    src={restaurant.img}
                    alt={restaurant.name}
                    fill
                    className="object-cover brightness-75"
                    priority
                />
                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-7xl mx-auto px-6 py-8 w-full text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-orange-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm">
                                {restaurant.isOnline ? "Open Now" : "Currently Closed"}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">{restaurant.name}</h1>
                        <div className="mt-3 flex items-center gap-4 text-sm font-medium drop-shadow-md">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">⭐ {restaurant.rating}</span>
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">{restaurant.category}</span>
                            <span className="drop-shadow-md opacity-90">📍 {restaurant.society}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        <h3 className="px-6 py-4 border-b border-gray-50 font-bold text-gray-900 bg-gray-50/50">Menu Categories</h3>
                        <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
                            {categories.map((cat: any) => (
                                <button
                                    key={cat._id}
                                    onClick={() => setActiveCategory(cat._id)}
                                    className={`w-full text-left px-6 py-4 flex items-center justify-between group transition-all ${activeCategory === cat._id
                                        ? "bg-orange-50 text-orange-600 font-bold"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <span className="truncate pr-4">{cat.name}</span>
                                    <span className={`text-xl transition-all ${activeCategory === cat._id ? "translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`}>→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="lg:col-span-3">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{currentCategoryData?.name || "Menu"}</h2>
                            {currentCategoryData?.description && (
                                <p className="text-sm text-gray-500 mt-1">{currentCategoryData.description}</p>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">{filteredItems.length} items</p>
                    </div>

                    <div className="space-y-6">
                        {filteredItems.map((item: any) => {
                            const selectedTokenId = selectedVariants[item._id];
                            const currentVariant = item.variants?.find((v: any) => v._id === selectedTokenId);
                            const price = currentVariant ? currentVariant.price : (item.variants?.[0]?.price || 0);

                            return (
                                <div key={item._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className={`absolute top-4 left-4 w-4 h-4 border-2 flex items-center justify-center p-0.5 z-10 ${item.foodType === "VEG" ? 'border-green-600' : 'border-red-600'}`}>
                                        <div className={`w-2 h-2 rounded-full ${item.foodType === "VEG" ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    </div>

                                    <div className="relative h-40 md:h-32 w-full md:w-32 rounded-xl overflow-hidden shrink-0 shadow-inner">
                                        <Image
                                            src={item.imageUrl || "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400&auto=format"}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                                                <p className="mt-1 text-sm text-gray-500 leading-relaxed max-w-xl">{item.description}</p>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {item.customization?.jainAvailable && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-bold uppercase tracking-wider border border-green-100">Jain Available</span>
                                                    )}
                                                    {item.customization?.spiceLevel && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold uppercase tracking-wider border border-red-100">Customizable Spice</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-lg font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">₹{price}</span>
                                                {currentVariant?.servingSize && (
                                                    <span className="text-[10px] font-bold text-gray-400">Portion: {currentVariant.servingSize}</span>
                                                )}
                                            </div>
                                        </div>

                                        {item.variants?.length > 1 && (
                                            <div className="mt-4 flex gap-3">
                                                {item.variants.map((v: any) => (
                                                    <button
                                                        key={v._id}
                                                        onClick={() => setSelectedVariants({ ...selectedVariants, [item._id]: v._id })}
                                                        className={`text-xs px-4 py-1.5 rounded-full border transition-all ${selectedVariants[item._id] === v._id
                                                            ? "bg-orange-600 text-white border-orange-600 shadow-md"
                                                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"
                                                            }`}
                                                    >
                                                        {v.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {item.addons?.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Available Add-ons</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.addons.map((addon: any) => (
                                                        <span key={addon._id} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-100">
                                                            {addon.name} (+₹{addon.price})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-6 flex justify-end">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={!restaurant.isOnline}
                                                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg cursor-pointer ${restaurant.isOnline
                                                    ? "bg-gray-900 text-white hover:bg-orange-600 hover:scale-105 active:scale-95"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                                    }`}
                                            >
                                                {restaurant.isOnline ? "Add to Cart" : "Kitchen Offline"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredItems.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 italic">No items available in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {totalItems > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <span className="bg-white text-orange-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">{totalItems}</span>
                        <span className="font-bold">Item{totalItems > 1 ? 's' : ''} added</span>
                    </div>
                    <div className="h-4 w-px bg-white/30"></div>
                    {/* <button onClick={() => alert('Proceed to checkout functionality coming soon!')} className="font-extrabold uppercase text-sm tracking-widest hover:underline whitespace-nowrap">View Cart →</button> */}
                    <button onClick={() => setOpenCart(true)} className="font-extrabold uppercase text-sm tracking-widest hover:underline whitespace-nowrap">View Cart →</button>
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
