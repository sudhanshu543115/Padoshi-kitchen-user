"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "@/api/axios";
import router from "next/router";

interface ProfileModalProps {
  onClose: () => void;
  mode: "view" | "edit";
}

export default function ProfileModal({ onClose, mode }: ProfileModalProps) {
  const { user, setUser, fetchUserProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  // Local state for form data to avoid direct mutation of global context
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    address: "",
    societyName: "",
    geoLocation: { coordinates: [0, 0] as number[] },
  });

  const isView = mode === "view";

  // Sync local state with global user state when modal opens or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        mobile: user.mobile || "",
        address: user.address || "",
        societyName: user.societyName || "",
        geoLocation: user.geoLocation || { coordinates: [0, 0] },
      });
    }
  }, [user]);

  // Auto-fetch removed to prevent flickering/data changes on open
  // The UserContext manages the initial load.


  /* ================= GEOLOCATION HANDLER (UPDATED) ================= */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError(true);
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          geoLocation: {
            ...prev.geoLocation,
            coordinates: [longitude, latitude],
          },
        }));

        setError(false);
        setMessage("Location fetched successfully 📍");
      },
      () => {
        setError(true);
        setMessage("Failed to get location. Please allow location access.");
      }
    );
  };
  /* =============================================================== */
  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage("");
    setError(false);

    // Validate all required fields
    if (!formData.fullName || !formData.mobile || !formData.address || !formData.societyName ||
      !formData.geoLocation.coordinates[0] || !formData.geoLocation.coordinates[1]) {
      setError(true);
      setMessage("Please fill in all required fields before saving.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.patch("user/auth/update-profile", {
        fullName: formData.fullName,
        mobile: formData.mobile,
        defaultLocation: {
          address: formData.address,
          societyName: formData.societyName,
          geoLocation: formData.geoLocation,
        },
      });

      if (response.data.success) {
        // Sync local state and mark profile as completed
        setUser({
          ...user,
          fullName: formData.fullName,
          mobile: formData.mobile,
          address: formData.address,
          societyName: formData.societyName,
          geoLocation: formData.geoLocation,
          profileCompleted: true, // Mark as completed
        });

        setMessage("Profile updated successfully! 🎉");
        setTimeout(onClose, 2000);
      }
    } catch (err: any) {
      setError(true);
      setMessage(
        err.response?.data?.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl mx-4 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isView ? "My Profile" : "Update Profile"}
          </h2>
          {/* Refresh button removed from here */}
        </div>

        <div className="space-y-4">
          {/* Only show these fields in View Mode */}
          {isView ? (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Full Name
                </label>
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                  {user.fullName || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Mobile Number
                </label>
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                  {user.mobile || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Address
                </label>
                
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                  {user.address || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Society Name
                </label>
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                  {user.societyName || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Location Coordinates
                </label>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Longitude:</span>
                      <p className="font-mono text-gray-800">{user.geoLocation.coordinates[0] || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Latitude:</span>
                      <p className="font-mono text-gray-800">{user.geoLocation.coordinates[1] || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Edit Mode - Show all fields with local state */
            <>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  User ID
                </label>
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                  {user.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full p-3 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Role
                </label>
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                  {user.role}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Profile Status
                </label>
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${user.profileCompleted
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${user.profileCompleted ? "bg-green-500" : "bg-yellow-500"
                      }`} />
                    {user.profileCompleted ? "Completed" : "Incomplete"}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  className="w-full p-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Address <span className="text-red-500">*</span>
                </label>
                <label onClick={() => router.push("/checkout/address")} className="text-sm font-semibold text-blue-600 mb-1 block">
                  Select Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Society Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.societyName}
                  onChange={(e) =>
                    setFormData({ ...formData, societyName: e.target.value })
                  }
                  className="w-full p-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter your society name"
                />
              </div>

              {!isView && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1 block">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.geoLocation.coordinates[0]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            geoLocation: {
                              ...formData.geoLocation,
                              coordinates: [
                                parseFloat(e.target.value),
                                formData.geoLocation.coordinates[1],
                              ],
                            },
                          })
                        }
                        className="w-full p-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Longitude"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1 block">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.geoLocation.coordinates[1]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            geoLocation: {
                              ...formData.geoLocation,
                              coordinates: [
                                formData.geoLocation.coordinates[0],
                                parseFloat(e.target.value),
                              ],
                            },
                          })
                        }
                        className="w-full p-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Latitude"
                      />
                    </div>
                  </div>

                  {/* ===== Use Current Location Button ===== */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      Use my current location
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {message && (
          <p
            className={`mt-4 text-sm text-center font-medium ${error ? "text-red-500" : "text-green-500"
              }`}
          >
            {message}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
            onClick={onClose}
            disabled={loading}
          >
            {isView ? "Close" : "Cancel"}
          </button>

          {!isView && (
            <button
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:bg-gray-400"
              onClick={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
