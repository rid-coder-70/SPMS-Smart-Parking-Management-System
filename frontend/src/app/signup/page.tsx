"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── SVG Icons ── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

/* ── Helper ── */
function calculateStrength(pw: string) {
  let score = 0;
  if (pw.length > 7) score += 20;
  if (/[A-Z]/.test(pw)) score += 20;
  if (/[a-z]/.test(pw)) score += 20;
  if (/[0-9]/.test(pw)) score += 20;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;
  return score;
}

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const strength = calculateStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error("All fields are required.");
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (strength < 60) {
        throw new Error("Please choose a stronger password.");
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", backgroundColor: "#0A0A0A" }}>
      <style dangerouslySetInnerHTML={{__html: `
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
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#CCFF00]/5 blur-[120px] rounded-full pointer-events-none" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        
        <div className="glass-card page-enter" style={{ width: "100%", maxWidth: 480, padding: "40px 36px", background: "#171717", borderColor: "#262626", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, background: "#CCFF00", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#000", boxShadow: "0 0 20px rgba(204,255,0,0.2)" }}>
              <IconParking />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-outfit)", color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>
              Create Account
            </h2>
            <p style={{ color: "#A3A3A3", fontSize: 14 }}>
              Register for full access to the SPMS dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert-error" style={{ marginBottom: 20, background: "#ef444415", borderColor: "#ef444440", color: "#ef4444" }}>
              <IconAlert /><span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="signup-name" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#A3A3A3", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Full Name
                </label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ color: "#737373" }}><IconUser /></span>
                  <input
                    id="signup-name" name="name" type="text" required
                    value={formData.name} onChange={handleChange}
                    className="auth-input neo-input" placeholder="John Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#A3A3A3", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon" style={{ color: "#737373" }}><IconMail /></span>
                <input
                  id="signup-email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="auth-input neo-input" placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#A3A3A3", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon" style={{ color: "#737373" }}><IconLock /></span>
                <input
                  id="signup-password" name="password" type={showPassword ? "text" : "password"} required
                  value={formData.password} onChange={handleChange}
                  className="auth-input neo-input" placeholder="••••••••" style={{ paddingRight: 48 }}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {formData.password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#A3A3A3" }}>Password Strength</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: strength < 40 ? "#ef4444" : strength < 80 ? "#f59e0b" : "#10b981" }}>
                      {strength < 40 ? "Weak" : strength < 80 ? "Good" : "Strong"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4].map(level => {
                      const isActive = strength >= level * 25;
                      let bg = "#262626";
                      if (isActive) {
                        if (strength < 50) bg = "#ef4444";
                        else if (strength < 100) bg = "#f59e0b";
                        else bg = "#10b981";
                      }
                      return (
                        <div key={level} style={{ flex: 1, height: 4, borderRadius: 2, background: bg, transition: "background 0.3s" }} />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="signup-confirm" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#A3A3A3", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Confirm Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon" style={{ color: "#737373" }}><IconLock /></span>
                <input
                  id="signup-confirm" name="confirmPassword" type={showPassword ? "text" : "password"} required
                  value={formData.confirmPassword} onChange={handleChange}
                  className="auth-input neo-input" placeholder="••••••••"
                  style={{
                    borderColor: formData.confirmPassword 
                      ? (formData.password === formData.confirmPassword ? "#10b981" : "#ef4444") 
                      : undefined
                  }}
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="neo-button" style={{ marginTop: 12, padding: "14px", borderRadius: "12px", border: "none", fontSize: "15px" }}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "#737373" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#CCFF00", fontWeight: 600, textDecoration: "none" }}>
              Sign In Instead
            </Link>
          </p>
          
        </div>
      </div>
    </div>
  );
}
