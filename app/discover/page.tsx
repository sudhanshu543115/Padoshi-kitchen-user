"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Discover Local Favorites
          </h1>
          <p className="text-gray-500 mt-2">Find the best dining spots in your neighborhood.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Location</label>
                <input
                  placeholder="Enter society name..."
                  value={filterSociety}
                  onChange={(e) => setFilterSociety(e.target.value)}
                  className="w-full mt-1 cursor-not-allowed p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm text-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Distance: <span className="text-orange-600">{range} km</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={range}
                  onChange={(e) => setRange(parseFloat(e.target.value))}
                  className="w-full h-2 mt-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Finding nearby kitchens...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">{restaurants.length === 0 ? "No kitchens found in this range." : "No kitchens match your society filter."}</p>
              <button
                onClick={() => { setRange(5); setFilterSociety(""); fetchKitchens(); }}
                className="mt-4 text-orange-600 font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRestaurants.map((r) => (
                <div key={r.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={r.img}
                      alt="img"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm z-10">
                      ⭐ {r.rating}
                    </div>
                    {!r.isOnline && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-800">Closed</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">{r.category}</span>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{r.name}</h2>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span className="truncate text-black">📍 {r.society}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{r.distance}</span>
                      <button
                        onClick={() => router.push(`/restaurant/${r.id}`)}
                        className={`text-sm font-bold ${r.isOnline ? "text-orange-600 hover:text-orange-700" : "text-gray-400 cursor-not-allowed"} cursor-pointer`}
                        disabled={!r.isOnline}
                      >
                        {r.isOnline ? "View Menu →" : "Offline"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}






