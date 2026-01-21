"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import api from "@/api/axios";

export default function CheckoutAddressPage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

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

    // Fetch saved addresses
    // Fetch saved addresses
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

                // Find the new default address to populate the form
                const newDefault = updatedAddresses.find((addr: any) => addr._id === addressId);
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
            const response = await api.delete(`user/auth/address/${addressId}`);
            if (response.data.success) {
                setSavedAddresses(prev => prev.filter(addr => addr._id !== addressId));
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("Submitting Address Data:", formData);

            const response = await api.post("user/auth/address", formData);

            if (response.data.success) {
                alert("Address added successfully! 🎉");
                router.push("/checkout/delivery");
            } else {
                alert(`Failed to add address: ${response.data.message || "Unknown error"}`);
            }
        } catch (error: any) {
            console.error("Add address error:", error);
            alert(error.response?.data?.message || "Failed to add address. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Delivery Addresses</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Saved Addresses */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>

                        {fetching ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : savedAddresses.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400">
                                <p>No saved addresses found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {savedAddresses.map((addr) => (
                                    <div key={addr._id} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${addr.isDefault ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-100 hover:border-orange-200'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${addr.label === "Home" ? "bg-green-100 text-green-700" :
                                                    addr.label === "Work" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {addr.label}
                                                </span>
                                                {addr.isDefault && (
                                                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Default</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!addr.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(addr._id)}
                                                        className="text-xs p-2 rounded cursor-pointer font-bold text-orange-600 border border-orange-600 hover:text-orange-600 uppercase tracking-wider transition-colors"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(addr._id)}
                                                    className="text-orange-600 hover:text-red-500 transition-colors p-2 rounded border  cursor-pointer border-orange-600"
                                                    title="Delete Address"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <p className="font-bold text-gray-900 leading-tight mb-1">{addr.addressLine}</p>
                                        <p className="text-sm text-gray-500">{addr.societyName}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Add New Address */}
                    <div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 sticky top-24">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Add New Address</h2>
                                <button
                                    onClick={handleAddNewAddress}
                                    className="text-sm font-bold text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    + Add New
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Label */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Address Label</label>
                                    <div className="flex gap-4">
                                        {["Home", "Work", "Other"].map((l) => (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, label: l })}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.label === l
                                                    ? "bg-orange-50 border-orange-500 text-orange-600"
                                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                                                    }`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Address Line */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Address Line</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.addressLine}
                                        onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-medium"
                                        placeholder="House/Flat No, Building, Street"
                                    />
                                </div>

                                {/* Society Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Society / Area Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.societyName}
                                        onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-medium"
                                        placeholder="e.g. Bhutani Alphathum"
                                    />
                                </div>

                                {/* GeoLocation */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-gray-700">Coordinates</label>
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                            📍 Use Current Location
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="Longitude"
                                            value={formData.geoLocation.coordinates[0]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                geoLocation: {
                                                    ...formData.geoLocation,
                                                    coordinates: [parseFloat(e.target.value), formData.geoLocation.coordinates[1]]
                                                }
                                            })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-medium text-sm"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="Latitude"
                                            value={formData.geoLocation.coordinates[1]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                geoLocation: {
                                                    ...formData.geoLocation,
                                                    coordinates: [formData.geoLocation.coordinates[0], parseFloat(e.target.value)]
                                                }
                                            })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-medium text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Is Default */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                    />
                                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">Set as default address</label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : "Save Address"}
                                </button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
