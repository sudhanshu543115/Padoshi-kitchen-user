"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/api/axios";

export default function LoginPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const sendOtp = async () => {
    if (mobile.length !== 10) {
      setError(true);
      setMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError(false);
    setMessage("");

    try {

      const response = await api.post("user/auth/send-otp", { mobile });

      if (response.data.success) {
        setOtpSent(true);
        setMessage("OTP sent successfully");
        setTimer(30);
        startTimer();
      }
    } catch (err: any) {

      setError(true);
      setMessage(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError(true);
      setMessage("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {

      const response = await api.post("user/auth/verify-otp", {
        mobile: mobile,
        otp: otp
      });

      if (response.data.success) {
        setMessage("Login successful 🎉");


        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);


        localStorage.setItem("user", JSON.stringify(response.data.user));


        if (response.data.profileCompleted === false) {
          
          setTimeout(() => router.push("/home"), 1500);
        } else {
          
          setTimeout(() => router.push("/home"), 1500);
        }
      }
    } catch (err: any) {
      setError(true);
      
      setMessage(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">

      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={70} height={70} />
        <span className="font-semibold text-lg text-gray-800">
          Padoshi Kitchen
        </span>
      </div>


      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Login using your mobile number
        </p>

        {!otpSent ? (
          <>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-white font-medium transition cursor-pointer ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Enter OTP
            </label>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-white font-medium transition cursor-pointer ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p className="mt-3 text-xs text-center text-gray-500">
              OTP expires in {timer}s
            </p>
          </>
        )}

        {message && (
          <p className={`mt-4 text-sm text-center ${error ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
