"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen  bg-gradient-to-br from-orange-50 to-yellow-100 flex flex-col items-center justify-start md:justify-center px-4 py-8 md:py-0 overflow-x-hidden">
      {/* Responsive Header */}
      <div className="w-full max-w-7xl flex items-center gap-3 mb-12 md:mb-0 md:absolute md:top-8 md:left-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="relative w-12 h-12 md:w-16 md:h-16 drop-shadow-md">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-black text-xl md:text-2xl text-gray-900 tracking-tight leading-none">
            Padoshi
          </span>
          <span className="font-bold text-sm md:text-base text-orange-600 uppercase tracking-widest leading-none mt-1">
            Kitchen
          </span>
        </div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        <div className="text-center md:text-left mt-25 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <h1 className="text-5xl md:text-3xl font-black text-gray-900 leading-tight tracking-tighter">
            Welcome to <br />
            <span className="text-orange-600 bg-clip-text">Padoshi Kitchen</span>
          </h1>

          <div className="space-y-4">
            <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
              Homemade food, crafted with love ❤️
              <span className="hidden md:inline"> Bringing you authentic flavors, fresh ingredients, and the warmth of home-style cooking.</span>
            </p>

            <p className="text-base md:text-lg text-gray-500 font-medium italic border-l-4 border-orange-200 pl-4 py-1">
              Discover delicious meals, trusted kitchens, and a taste that feels like home.
            </p>
          </div>

          <button
            onClick={() => router.push("/discover")}
            className="group relative w-full md:w-auto p-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-orange-600 transition-all shadow-2xl hover:scale-[1.05] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 mx-auto md:mx-0 overflow-hidden"
          >
            <span className="relative z-10 font-bold">Discover Now</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>


        <div className="relative group flex justify-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div className="absolute -inset-4 bg-orange-200/50 rounded-3xl  group-hover:blur-3xl transition-all duration-500 opacity-50"></div>
          <Image
            src="/image2.png"
            alt="Padoshi Kitchen Food"
            width={550}
            height={550}
            className="relative rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:scale-[1.02] transition-transform duration-700 border-8 border-white"
          />
        </div>

      </div>
    </div>
  );
}
