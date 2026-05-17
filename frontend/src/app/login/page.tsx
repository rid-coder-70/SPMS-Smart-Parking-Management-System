"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── SVG Icons ── */
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const IconParking = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ── Parking Slots Visualisation ── */
const SLOTS = [
  "occupied","occupied","available","available",
  "reserved","occupied","available","occupied",
  "available","available","occupied","reserved",
  "occupied","available","available","occupied",
];

function ParkingVisual() {
  const [slots, setSlots] = useState(SLOTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlots((prev) =>
        prev.map((s) => {
          if (Math.random() < 0.12) {
            const options = ["occupied", "available", "reserved"];
            return options[Math.floor(Math.random() * options.length)];
          }
          return s;
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const occupied = slots.filter((s) => s === "occupied").length;
  const available = slots.filter((s) => s === "available").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", alignItems: "center" }}>
      <div className="parking-grid">
        {slots.map((slot, i) => (
          <div key={i} className={`parking-slot neo-${slot}`} title={slot}>
            {slot === 'occupied' && (
               <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                 <IconLock className="w-3 h-3 text-[#CCFF00]" />
               </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { color: "repeating-linear-gradient(-45deg, #CCFF00, #CCFF00 4px, #000 4px, #000 8px)", label: "Occupied" },
          { color: "#171717", border: "1px dashed #404040", label: "Available" },
          { color: "#333", border: "1px solid #CCFF00", label: "Reserved" },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: border || 'none' }} />
            <span style={{ fontSize: 12, color: "#A3A3A3", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: 260 }}>
        <div className="stat-card" style={{ flex: 1, background: '#121212', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="stat-icon" style={{ background: "rgba(255,255,255,0.05)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{available}</div>
            <div style={{ fontSize: 11, color: "#A3A3A3", marginTop: 2 }}>Free</div>
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, background: '#121212', border: '1px solid rgba(204,255,0,0.2)' }}>
          <div className="stat-icon" style={{ background: "rgba(204,255,0,0.1)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#CCFF00", lineHeight: 1 }}>{occupied}</div>
            <div style={{ fontSize: 11, color: "#A3A3A3", marginTop: 2 }}>Taken</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) throw new Error("Please enter both email and password.");
      await new Promise((resolve) => setTimeout(resolve, 1400));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", backgroundColor: "#0A0A0A" }}>
      {/* Dynamic Styles for Theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .neo-occupied {
          background: repeating-linear-gradient(-45deg, #CCFF00, #CCFF00 6px, #000 6px, #000 12px) !important;
          border: 1px solid #000 !important;
          position: relative;
          overflow: hidden;
        }
        .neo-available {
          background: #171717 !important;
          border: 1px dashed #404040 !important;
        }
        .neo-reserved {
          background: #CCFF0020 !important;
          border: 1px solid #CCFF00 !important;
          box-shadow: inset 0 0 10px rgba(204,255,0,0.1);
        }
        .neo-input {
          background: #121212;
          border: 1px solid #262626;
          color: #fff;
        }
        .neo-input:focus {
          border-color: #CCFF00;
          box-shadow: 0 0 0 1px #CCFF00;
        }
        .neo-button {
          background: #CCFF00;
          color: #000;
          font-weight: 700;
          transition: all 0.2s;
        }
        .neo-button:hover {
          background: #e6ff33;
          box-shadow: 0 4px 15px rgba(204,255,0,0.3);
          transform: translateY(-1px);
        }
        .auth-bg-neo {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(204,255,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(204,255,0,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          z-index: 0;
        }
      `}} />

      <div className="auth-bg-neo" />
      
      {/* Floating Back to Home Button */}
      <Link href="/" style={{
        position: "absolute",
        top: "24px",
        left: "24px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#A3A3A3",
        fontSize: "14px",
        fontWeight: 600,
        textDecoration: "none",
        padding: "8px 16px",
        background: "#171717",
        border: "1px solid #262626",
        borderRadius: "100px",
        transition: "all 0.2s"
      }} className="hover:text-white hover:border-[#CCFF00]/50 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)]">
        <IconArrowLeft /> Back to Home
      </Link>
      
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CCFF00]/5 blur-[100px] rounded-full pointer-events-none" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", minHeight: "100vh", alignItems: "stretch" }}>

        {/* ── Left panel (visual) ── */}
        <div
          className="side-panel"
          style={{
            flex: "0 0 45%",
            display: "none",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
            gap: "48px",
            background: "#121212",
            borderRight: "1px solid #262626"
          }}
          id="login-side-panel"
        >
          <style>{`@media (min-width: 1024px) { #login-side-panel { display: flex !important; } }`}</style>

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(204,255,0,0.1)",
              border: "1px solid rgba(204,255,0,0.2)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 32,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#CCFF00", boxShadow: "0 0 8px #CCFF00" }} />
              <span style={{ fontSize: 11, color: "#CCFF00", letterSpacing: "0.1em", fontWeight: 700 }}>SYSTEM ONLINE</span>
            </div>

            <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16, fontFamily: "var(--font-outfit)" }}>
              Central Command
            </h1>
            <p style={{ color: "#A3A3A3", fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
              Access the live dashboard to monitor grid status, billing anomalies, and physical security parameters.
            </p>
          </div>

          <ParkingVisual />
        </div>

        {/* ── Right panel (form) ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
          <div className="glass-card page-enter" style={{ width: "100%", maxWidth: 440, padding: "40px 36px", background: "#171717", borderColor: "#262626", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>

            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, background: "#CCFF00", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#000", boxShadow: "0 0 20px rgba(204,255,0,0.2)" }}>
                <IconParking />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-outfit)", color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>
                Welcome Back
              </h2>
              <p style={{ color: "#A3A3A3", fontSize: 14 }}>
                Enter your credentials to access SPMS
              </p>
            </div>

            {error && (
              <div className="alert-error" style={{ marginBottom: 20, background: "#ef444415", borderColor: "#ef444440" }}>
                <IconAlert /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label htmlFor="login-email" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#A3A3A3", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ color: "#737373" }}><IconMail /></span>
                  <input
                    id="login-email" name="email" type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="auth-input neo-input"
                    placeholder="admin@spms.com"
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 600, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Password
                  </label>
                  <Link href="/forgot-password" style={{ fontSize: 13, color: "#CCFF00", textDecoration: "none", fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ color: "#737373" }}><IconLock /></span>
                  <input
                    id="login-password" name="password" type={showPassword ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="auth-input neo-input"
                    placeholder="••••••••" style={{ paddingRight: 48 }}
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  id="login-remember" type="checkbox"
                  style={{ width: 16, height: 16, accentColor: "#CCFF00", cursor: "pointer" }}
                  checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="login-remember" style={{ fontSize: 14, color: "#A3A3A3", cursor: "pointer" }}>
                  Keep me securely logged in
                </label>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary neo-button" style={{ marginTop: 8, padding: "14px", borderRadius: "12px", border: "none" }}>
                {isLoading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <div className="divider" style={{ margin: "28px 0", color: "#525252" }}>
              <span style={{ padding: "0 10px" }}>OR</span>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-social" style={{ background: "#121212", borderColor: "#262626", color: "#e5e5e5" }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "#737373" }}>
              Don&apos;t have access?{" "}
              <Link href="/signup" style={{ color: "#CCFF00", fontWeight: 600, textDecoration: "none" }}>
                Request an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
