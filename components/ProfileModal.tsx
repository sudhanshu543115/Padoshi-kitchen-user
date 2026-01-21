"use client";

import { useUser } from "@/context/UserContext";
import { useState } from "react";
import api from "@/api/axios";

interface ProfileModalProps {
  onClose: () => void;
  mode: "view" | "edit";
}

export default function ProfileModal({ onClose, mode }: ProfileModalProps) {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const isView = mode === "view";

  /* ================= GEOLOCATION HANDLER (ADDED) ================= */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError(true);
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;

        setUser({
          ...user,
          geoLocation: {
            ...user.geoLocation,
            coordinates: [longitude, latitude],
          },
        });

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

    try {
      const response = await api.patch("user/auth/complete-profile", {
        fullName: user.fullName,
        mobile: user.mobile,
        defaultLocation: {
          address: user.address,
          societyName: user.societyName,
          geoLocation: user.geoLocation,
        },
      });

      if (response.data.success) {
        // Sync local state
        setUser({
          ...user,
          fullName: user.fullName,
          mobile: user.mobile,
          address: user.address,
          societyName: user.societyName,
          geoLocation: user.geoLocation,
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isView ? "My Profile" : "Update Profile"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Full Name
            </label>
            {isView ? (
              <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                {user.fullName}
              </p>
            ) : (
              <input
                type="text"
                value={user.fullName}
                onChange={(e) =>
                  setUser({ ...user, fullName: e.target.value })
                }
                className="w-full p-3 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter your full name"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Mobile Number
            </label>
            {isView ? (
              <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                {user.mobile || "Not provided"}
              </p>
            ) : (
              <input
                type="tel"
                value={user.mobile || ""}
                onChange={(e) =>
                  setUser({ ...user, mobile: e.target.value })
                }
                className="w-full p-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter your mobile number"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Address
            </label>
            {isView ? (
              <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-black font-medium">
                {user.address}
              </p>
            ) : (
              <input
                type="text"
                value={user.address}
                onChange={(e) =>
                  setUser({ ...user, address: e.target.value })
                }
                className="w-full p-3 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter your address"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Society Name
            </label>
            {isView ? (
              <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                {user.societyName}
              </p>
            ) : (
              <input
                type="text"
                value={user.societyName}
                onChange={(e) =>
                  setUser({ ...user, societyName: e.target.value })
                }
                className="w-full p-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter your society name"
              />
            )}
          </div>

          {!isView && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={user.geoLocation.coordinates[0]}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        geoLocation: {
                          ...user.geoLocation,
                          coordinates: [
                            parseFloat(e.target.value),
                            user.geoLocation.coordinates[1],
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
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={user.geoLocation.coordinates[1]}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        geoLocation: {
                          ...user.geoLocation,
                          coordinates: [
                            user.geoLocation.coordinates[0],
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

              {/* ===== Use Current Location Button (ADDED) ===== */}
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
    </div>
  );
}















// {
//     kitchenId,                    // From first cart item
//     delivery: {
//         mode: "KITCHEN_DELIVERY" | "SELF_DELIVERY" | "SELF_PICKUP",
//         address: {
//             addressLine: user.address,        // From user context
//             societyName: user.societyName,    // From user context  
//             geoLocation: {
//                 type: "Point",
//                 coordinates: user.geoLocation.coordinates  // From user context
//             }
//         }
//     }
// }











// {
//   "kitchenId": "695f356e76d3b958908d1da5",
//   "delivery": {
//     "mode": "KITCHEN_DELIVERY",
//     "address": {
//       "addressLine": "Flat 402, Tower B",
//       "societyName": "Sector 62 A Block",
//       "geoLocation": {
//         "type": "Point",
//         "coordinates": [77.3649, 28.6289]
//       }
//     }
//   }
// }
