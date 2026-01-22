"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function allKitchen() {
  const router = useRouter();
  const { user } = useUser();

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSociety, setFilterSociety] = useState("");
  const [range, setRange] = useState<number>(3);

  const fetchKitchens = useCallback(async () => {
    if (!user?.geoLocation?.coordinates) return;

    setLoading(true);
    try {
      const radius = range * 1000;
      const [lng, lat] = user.geoLocation.coordinates;

      const response = await api.get(
        `user/kitchens?lat=${lat}&lng=${lng}&radius=${radius}`
      );

      if (response.data.success) {
        const mapped = response.data.kitchens.map((k: any) => ({
          id: k._id,
          name: k.name || k.restaurantInfo?.name || "Unnamed Kitchen",
          society: k.societyName || "Nearby",
          coords: k.geoLocation?.coordinates || [0, 0],
          distance: k.preparationTime ? `${k.preparationTime} mins` : "Nearby",
          rating: k.rating || 4.5,
          category:
            k.cuisineType?.[0] ||
            k.operations?.serviceType ||
            "Home Food",
          img:
            k.images?.[0] ||
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format",
          isOnline: k.isOnline,
        }));

        setRestaurants(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch kitchens:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [user?.geoLocation?.coordinates, range]);

  useEffect(() => {
    fetchKitchens();
  }, [fetchKitchens]);

  const filteredRestaurants = restaurants.filter(
    (r) =>
      !filterSociety ||
      r.society.toLowerCase().includes(filterSociety.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-black">
            Discover Local <span className="text-orange-400">Kitchens</span>
          </h1>
          <p className="text-slate-300 mt-2 max-w-xl">
            Authentic homemade meals from neighbors near you.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <div className="sticky top-24 bg-white p-6 rounded-2xl shadow border">
            <label className="text-xs font-bold uppercase text-slate-400">
              Location
            </label>
            <div className="relative mt-2">
              <div className="absolute left-3 top-3">
                <SearchIcon />
              </div>
              <input
                value={filterSociety}
                onChange={(e) => setFilterSociety(e.target.value)}
                placeholder="Search society..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50"
              />
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Distance</span>
                <span>{range} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={range}
                onChange={(e) => setRange(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(filteredRestaurants.length
                ? filteredRestaurants
                : restaurants
              ).map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl shadow border overflow-hidden flex flex-col"
                >
                  <div className="relative h-48">
                    <Image
                      src={r.img}
                      alt={r.name}
                      fill
                      className={`object-cover ${
                        !r.isOnline ? "grayscale" : ""
                      }`}
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="font-bold text-lg">{r.name}</h2>

                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <MapPinIcon />
                      {r.society}
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-4">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <ClockIcon />
                        {r.distance}
                      </div>

                      <button
                        disabled={!r.isOnline}
                        onClick={() => router.push(`/restaurant/${r.id}`)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${
                          r.isOnline
                            ? "bg-slate-900 text-white hover:bg-orange-600"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {r.isOnline ? "View Menu" : "Closed"}
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
