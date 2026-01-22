"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/api/axios";

// --- Icons ---
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);
const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

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
    <div className="min-h-screen flex bg-white font-sans selection:bg-orange-100 selection:text-orange-600">
      
      {/* LEFT SIDE - Hero Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop" 
          alt="Cooking" 
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-12 text-white z-10">
           <h1 className="text-5xl font-black mb-4 leading-tight">Taste the <br/> <span className="text-orange-500">Warmth of Home</span></h1>
           <p className="text-lg text-slate-300 max-w-md">Join Padoshi Kitchen to discover authentic homemade meals from your neighbors.</p>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 lg:bg-white">
        
        {/* Mobile Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob lg:hidden"></div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Header */}
          <div className="text-center">
            <div className="inline-block p-3 rounded-2xl bg-white shadow-lg shadow-orange-100 mb-6">
               <Image src="/logo.png" alt="Logo" width={60} height={60} className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back!</h2>
            <p className="mt-2 text-slate-500">Please enter your details to sign in.</p>
          </div>

          <div className="mt-8 space-y-6">
            {!otpSent ? (
              /* Step 1: Mobile Input */
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <PhoneIcon />
                    </div>
                    <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-medium border-r border-slate-200 pr-2 mr-2">+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="98765 43210"
                      className="block w-full pl-24 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-lg font-medium text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm group-hover:border-slate-300"
                    />
                  </div>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 hover:shadow-orange-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Get OTP <ArrowRightIcon />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Step 2: OTP Input */
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex justify-between items-center">
                   <div className="text-sm">
                      <p className="text-slate-500">Sent to <span className="font-bold text-slate-800">+91 {mobile}</span></p>
                   </div>
                   <button onClick={() => { setOtpSent(false); setOtp(""); setMessage(""); }} className="text-xs font-bold text-orange-600 hover:underline">
                      Change?
                   </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">Verification Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockClosedIcon />
                    </div>
                    <input
                      type="number"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-2xl font-bold tracking-[0.5em] text-center text-slate-900 placeholder:text-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Verify & Login"
                  )}
                </button>

                <div className="text-center">
                   {timer > 0 ? (
                      <p className="text-sm text-slate-400 font-medium">Resend code in <span className="text-slate-800 font-bold">00:{timer < 10 ? `0${timer}` : timer}</span></p>
                   ) : (
                      <button onClick={sendOtp} className="text-sm font-bold text-orange-600 hover:underline cursor-pointer">
                        Resend OTP
                      </button>
                   )}
                </div>
              </div>
            )}

            {/* Messages Area */}
            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-bottom-2 fade-in ${
                error 
                  ? "bg-red-50 text-red-700 border border-red-100" 
                  : "bg-green-50 text-green-700 border border-green-100"
              }`}>
                 <span className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-green-500"}`}></span>
                 {message}
              </div>
            )}
          </div>
          
          <p className="text-center text-xs text-slate-400 mt-8">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}