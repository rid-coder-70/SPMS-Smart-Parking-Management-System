"use client";

import React from "react";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.className} ${outfit.className}`}>
      <body>
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden font-sans">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-md w-full bg-[#0f172a]/60 backdrop-blur-xl border border-red-500/20 rounded-3xl p-10 text-center shadow-2xl">
            <h1 className="text-4xl font-extrabold text-red-500 font-[Outfit] mb-4">
              Critical Error
            </h1>
            
            <p className="text-gray-400 mb-8 leading-relaxed">
              A fatal error occurred at the application root level. The SPMS interface failed to initialize.
            </p>

            <button
              onClick={() => reset()}
              className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-xl transition-all hover:bg-red-500/20 active:scale-95"
            >
              Attempt Recovery
            </button>
            
            {error.digest && (
              <p className="mt-6 text-xs text-gray-600 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
