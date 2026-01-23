"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";

// --- Icons ---
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.63-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const CrosshairIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

export default function CheckoutAddressPage() {

  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isFromSavedAddress, setIsFromSavedAddress] = useState(false);


  const [formData, setFormData] = useState({
    label: "Home",
    addressLine: user?.address || "",
    societyName: user?.societyName || "",
    geoLocation: {
      type: "Point",
      coordinates: user?.geoLocation?.coordinates || [0, 0],
    },
    isDefault: true,
  });

  const fetchAddresses = async () => {
    try {
      const response = await api.get("user/auth/address");
      if (response.data.success) {
        setSavedAddresses(response.data.addresses);
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await api.patch(`user/auth/${addressId}/default`);
      if (response.data.success) {
        const updatedAddresses = response.data.addresses;
        setSavedAddresses(updatedAddresses);

        const newDefault = updatedAddresses.find(
          (addr: any) => addr._id === addressId
        );

        if (newDefault) {
          setFormData({
            label: newDefault.label,
            addressLine: newDefault.addressLine,
            societyName: newDefault.societyName,
            geoLocation: {
              type: "Point",
              coordinates: newDefault.geoLocation.coordinates,
            },
            isDefault: true,
          });

          setIsFromSavedAddress(true); // ✅ MARK AS EXISTING
        }
      }
    } catch (error: any) {
      console.error("Failed to set default", error);
      alert(error.response?.data?.message || "Failed to set default address");
    }
  };


  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await api.delete(`user/auth/${addressId}`);
      if (response.data.success) {
        setSavedAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      } else {
        alert(response.data.message || "Failed to delete address");
      }
    } catch (error: any) {
      console.error("Failed to delete address", error);
      alert(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          geoLocation: {
            ...prev.geoLocation,
            coordinates: [position.coords.longitude, position.coords.latitude],
          },
        }));
      },
      (error) => {
        alert("Unable to retrieve your location");
      }
    );
  };

  const handleAddNewAddress = () => {
    setFormData({
      label: "Home",
      addressLine: "",
      societyName: "",
      geoLocation: {
        type: "Point",
        coordinates: [0, 0],
      },
      isDefault: false,
    });

    setIsFromSavedAddress(false); // ✅ NEW ADDRESS MODE
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ❌ BLOCK DB SAVE IF EXISTING DEFAULT ADDRESS
    if (isFromSavedAddress) {
      router.push("/discover?openCart=true");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("user/auth/address", formData);

      if (response.data.success) {
        alert("Address added successfully! 🎉");
        router.push("/discover?openCart=true");
      } else {
        alert(
          `Failed to add address: ${response.data.message || "Unknown error"
          }`
        );
      }
    } catch (error: any) {
      console.error("Add address error:", error);
      alert(
        error.response?.data?.message ||
        "Failed to add address. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Addresses</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your saved locations or add a new one for delivery.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT COLUMN: Saved Addresses List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Saved Addresses</h2>
              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{savedAddresses.length} Found</span>
            </div>

            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium">Loading addresses...</p>
              </div>
            ) : savedAddresses.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No saved addresses</h3>
                <p className="text-slate-400">Add a new address to speed up your checkout.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`group relative bg-white rounded-2xl transition-all duration-300 overflow-hidden ${addr.isDefault
                      ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/10'
                      : 'border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200'
                      }`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        {/* Label Badge */}
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${addr.label === "Home" ? "bg-green-50 text-green-700 ring-1 ring-green-100" :
                            addr.label === "Work" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" :
                              "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
                            }`}>
                            {addr.label === "Home" && <HomeIcon />}
                            {addr.label === "Work" && <BriefcaseIcon />}
                            {addr.label !== "Home" && addr.label !== "Work" && <MapPinIcon />}
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                              Default
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800 leading-snug">{addr.addressLine}</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{addr.societyName}</p>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-2">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefault(addr._id)}
                            className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-1.5 uppercase tracking-wide"
                          >
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-orange-500 transition-colors"></div>
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-orange-600 flex items-center gap-1.5 uppercase tracking-wide">
                            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-500 flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Selected
                          </span>
                        )}

                        <button
                          onClick={() => handleDelete(addr._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Address"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Add New Form */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-orange-500 w-1.5 h-5 rounded-full"></span>
                    Add New Address
                  </h2>
                  <button onClick={handleAddNewAddress} className="text-xs font-bold text-orange-600 hover:underline">
                    Reset Form
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                  {/* Label Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Label</label>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                      {["Home", "Work", "Other"].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setFormData({ ...formData, label: l })}
                          className={`py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${formData.label === l
                            ? "bg-white text-orange-600 shadow-md ring-1 ring-slate-100"
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Address</label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          value={formData.addressLine}
                          onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                          placeholder="Flat No, Building, Street"
                          className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition font-medium text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Society / Area</label>
                      <input
                        required
                        type="text"
                        value={formData.societyName}
                        onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                        placeholder="e.g. Gotham City"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition font-medium text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Geolocation Section */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coordinates</label>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors bg-orange-100/50 hover:bg-orange-100 px-2 py-1 rounded-md"
                      >
                        <span className="group-hover:animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
                        <CrosshairIcon />
                        Locate Me
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Lat</span>
                        <input
                          type="number" step="any"
                          value={formData.geoLocation.coordinates[1]}
                          onChange={(e) => setFormData({
                            ...formData,
                            geoLocation: {
                              ...formData.geoLocation,
                              coordinates: [formData.geoLocation.coordinates[0], parseFloat(e.target.value)]
                            }
                          })}
                          className="w-full pl-10 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-orange-500 outline-none"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Lng</span>
                        <input
                          type="number" step="any"
                          value={formData.geoLocation.coordinates[0]}
                          onChange={(e) => setFormData({
                            ...formData,
                            geoLocation: {
                              ...formData.geoLocation,
                              coordinates: [parseFloat(e.target.value), formData.geoLocation.coordinates[1]]
                            }
                          })}
                          className="w-full pl-10 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Default Toggle */}
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm checked:border-orange-500 checked:bg-orange-500 transition-all"
                      />
                      <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-700">Set as default address</span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Saving...
                      </span>
                    ) : "Save Address"}
                  </button>

                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}