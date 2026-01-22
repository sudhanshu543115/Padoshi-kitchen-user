"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center overflow-hidden selection:bg-orange-100 selection:text-orange-600">
       <div className="absolute top-[10%] right-[-5%] w-[300px] h-[200px] bg-orange-200/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-200/30 rounded-full blur-[120px]" />
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
       
      </div>

      {/* Navbar / Logo Area */}
      <nav className="absolute top-0 left-0 w-full p-6 md:p-8 flex items-center z-20">
        <div className="flex items-center gap-3  bg-white/60 backdrop-blur-md py-2 px-4 rounded-full border border-white/50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative w-8 h-8 md:w-10 md:h-10">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div className="flex  flex-col">
            <span className="font-bold text-lg text-slate-800 leading-tight">
              Padoshi Kitchen
            </span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-7xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-20 md:py-0">
        
        {/* Left Content */}
        <div className="order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="absolute w-[90%] h-[90%] border border-orange-200 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-[95%] h-[95%] border border-dashed border-slate-200 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
          <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold tracking-widest uppercase mb-2">
              Homemade Happiness
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mt-9">
              Taste the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
                Warmth of Home
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-medium">
              Authentic flavors and fresh ingredients, crafted with love. 
              <span className="hidden md:inline"> Discover meals that bring the nostalgia of your favorite home-style cooking directly to your table.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push("/discover")}
              className="group relative w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-base transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Discovering
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <p className="text-sm text-slate-400 italic">
              Trusted by 1000+ Foodies
            </p>
          </div>
        </div>

        {/* Right Image */}
        <div className="order-1 md:order-2 relative flex justify-center items-center animate-in fade-in zoom-in duration-1000 delay-200">
          
          {/* Decorative Circle Behind Image */}
          <div className="absolute w-[90%] h-[90%] border border-orange-200 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-[95%] h-[95%] border border-dashed border-slate-200 rounded-full animate-[spin_30s_linear_infinite_reverse]" />

          <div className="relative z-10 w-full max-w-md aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-yellow-50 rounded-[2rem] transform rotate-3 scale-95 opacity-50"></div>
            <Image
              src="/image2.png"
              alt="Padoshi Kitchen Food"
              width={600}
              height={600}
              className="relative rounded-[2rem] shadow-2xl object-cover hover:scale-[1.02] transition-transform duration-500"
            />
            
            {/* Floating Badge Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-3 animate-bounce [animation-duration:3s]">
              <div className="bg-green-100 p-2 rounded-full text-xl">🌿</div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Ingredients</p>
                <p className="text-sm font-bold text-slate-800">100% Fresh</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}