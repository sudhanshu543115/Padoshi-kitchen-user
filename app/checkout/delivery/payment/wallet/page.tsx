"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WalletPaymentPage() {
  const router = useRouter();

  const walletBalance = 500; // dummy balance

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayNow = () => {
    setShowModal(true);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        router.push("/discover");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-black mb-2 text-slate-900">
          Wallet Payment
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Use your wallet balance
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-slate-500">Available Balance</p>
          <p className="text-2xl font-black text-slate-900">₹{walletBalance}</p>
        </div>

        <button
          onClick={handlePayNow}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg"
        >
          Pay from Wallet
        </button>

        <p className="text-xs text-slate-400 text-center mt-4">
          Dummy wallet payment screen
        </p>
      </div>

      {/* ---------- PAYMENT MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
            {isProcessing && (
              <>
                <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="font-bold text-lg text-slate-800">
                  Processing Wallet Payment
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Deducting amount from wallet
                </p>
              </>
            )}

            {isSuccess && (
              <>
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-black text-xl text-slate-900">
                  Payment Successful 🎉
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Your order has been placed successfully
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
