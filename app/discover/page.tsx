"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";

// Helper Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useUser();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSociety, setFilterSociety] = useState("");
  const [range, setRange] = useState<number>(3);

  const fetchKitchens = useCallback(async () => {
    setLoading(true);
    try {
      const radius = range * 1000;
      const [lng, lat] = user.geoLocation.coordinates;
      const response = await api.get(`user/kitchens?lat=${lat}&lng=${lng}&radius=${radius}`);

      if (response.data.success) {
        const mappedKitchens = response.data.kitchens.map((k: any) => ({
          id: k._id,
          name: k.name || k.restaurantInfo?.name || "Unnamed Kitchen",
          society: k.societyName || "Nearby",
          coords: k.geoLocation?.coordinates || [0, 0],
          distance: k.preparationTime ? `${k.preparationTime} mins` : "Nearby",
          rating: k.rating || 4.5,
          category: k.cuisineType?.[0] || k.operations?.serviceType || "Home Food",
          img: k.images?.[0] || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format",
          isOnline: k.isOnline
        }));
        setRestaurants(mappedKitchens);
      }
    } catch (err) {
      console.error("Failed to fetch kitchens:", err);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [user.geoLocation.coordinates, range]);

  useEffect(() => {
    fetchKitchens();
  }, [fetchKitchens]);

  const filteredRestaurants = restaurants.filter(
    (r) => !filterSociety || r.society.toLowerCase().includes(filterSociety.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-5 pt-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-black tracking-tight">
            Discover Local <span className="text-orange-400">Kitchens</span>
          </h1>
          <p className="text-slate-300 text-lg font-medium max-w-xl">
            Authentic homemade meals from neighbors near you. Experience the taste of home, away from home.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 ">
        
        {/* Sidebar Filters - Sticky */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Filters</h3>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Refine</span>
              </div>

              <div className="space-y-6">
                {/* Search Input */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 block">Location</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon />
                    </div>
                    <input
                      placeholder="Search society..."
                      value={filterSociety}
                      onChange={(e) => setFilterSociety(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Range Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Distance</label>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">
                      {range} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={range}
                    onChange={(e) => setRange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-colors"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-2">
                    <span>0.5km</span>
                    <span>10km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            // Skeleton Loader
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="h-40 bg-slate-100 rounded-xl animate-pulse mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRestaurants.length === 0 && restaurants.length > 0 && (
                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-xl">🧐</span>
                  <div>
                    <h3 className="text-sm font-bold text-orange-900">No exact matches for "{filterSociety}"</h3>
                    <p className="text-xs text-orange-700 mt-1">Showing you other great kitchens nearby!</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(filteredRestaurants.length > 0 ? filteredRestaurants : restaurants).map((r) => (
                  <div 
                    key={r.id} 
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={r.img}
                        alt={r.name}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-110 ${!r.isOnline ? "grayscale" : ""}`}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md shadow-sm ${
                           r.isOnline 
                             ? "bg-green-500/90 text-white" 
                             : "bg-slate-800/90 text-slate-200"
                         }`}>
                           {r.isOnline ? "Open Now" : "Closed"}
                         </span>
                         <span className="bg-white/95 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                           ⭐ {r.rating}
                         </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-4">
                        <div className="inline-block px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-2">
                          {r.category}
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">
                          {r.name}
                        </h2>
                        <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm">
                          <MapPinIcon />
                          <span className="truncate">{r.society}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                           <ClockIcon />
                           {r.distance}
                         </div>

                        <button
                          onClick={() => router.push(`/restaurant/${r.id}`)}
                          disabled={!r.isOnline}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2
                            ${r.isOnline 
                              ? "bg-slate-900 text-white hover:bg-orange-600 shadow-md hover:shadow-lg" 
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"}
                          `}
                        >
                          {r.isOnline ? (
                            <>
                              View Menu 
                              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </>
                          ) : (
                            "Unavailable"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}