"use client";

import React, { useEffect } from "react";

const IconAlert = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("SPMS Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#0f172a]/60 backdrop-blur-xl border border-red-500/20 rounded-3xl p-10 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <IconAlert />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-white font-[Outfit] mb-4">
          System Malfunction
        </h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          An unexpected error occurred in the parking management system. Our technicians have been notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-xl transition-all hover:bg-red-500/20 active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl transition-all hover:bg-white/10 active:scale-95"
          >
            Go to Home
          </button>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
