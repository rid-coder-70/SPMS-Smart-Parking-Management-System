import Link from "next/link";
import React from "react";

const IconCompass = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00d4ff] animate-pulse">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <IconCompass />
        </div>
        
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 font-[Outfit] mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4">Route Not Found</h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          The parking slot you are looking for doesn't exist, has been moved, or is currently out of service.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center w-full py-4 bg-gradient-to-r from-[#00b4d8] to-[#7c3aed] text-white font-semibold rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
