"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ── Inline Icons ── */
const IconParking = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);

const IconCamera = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconMail = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconCar = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-6 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"/>
  </svg>
);

const IconLock = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden font-sans selection:bg-[#CCFF00] selection:text-black">
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-up {
          opacity: 0;
          transform: translateY(30px);
          animation: revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes revealUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        
        .floating {
          animation: floating 6s ease-in-out infinite;
        }
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .stripe-bg {
          background: repeating-linear-gradient(
            -45deg,
            #CCFF00,
            #CCFF00 10px,
            #000000 10px,
            #000000 20px
          );
        }

        .nav-glass {
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
          
        .neo-button {
          background: #CCFF00;
          color: #000;
          box-shadow: 0 4px 14px rgba(204, 255, 0, 0.2);
          transition: all 0.2s;
        }
        .neo-button:hover {
          box-shadow: 0 6px 20px rgba(204, 255, 0, 0.4);
          transform: translateY(-2px);
        }
      `}} />

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-glass py-4' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#CCFF00]">
            <div className="bg-[#171717] p-2 rounded-lg border border-white/10">
              <IconParking className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-[Outfit]">SPMS</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-bold neo-button px-6 py-2.5 rounded-full">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Topography Background Graphic (Subtle) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"100%\\" height=\\"100%\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"n\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.005\\" numOctaves=\\"2\\" result=\\"noise\\"%3E%3C/feTurbulence%3E%3CfeColorMatrix type=\\"matrix\\" values=\\"1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0\\" in=\\"noise\\"%3E%3C/feColorMatrix%3E%3C/filter%3E%3Crect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23n)\\"/%3E%3C/svg%3E")'
        }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col xl:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Content */}
          <div className="flex-1 text-center xl:text-left z-10 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#171717] border border-white/10 text-[#CCFF00] text-xs font-bold tracking-widest uppercase mb-8 reveal-up">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
              Live Dashboard Monitoring
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 reveal-up delay-100 font-[Outfit]">
              Smart Parking <br className="hidden sm:block" />
              <span className="text-[#CCFF00]">Management</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto xl:mx-0 reveal-up delay-200 leading-relaxed">
              Experience the next generation of parking. Real-time slot monitoring, automated billing, and seamless access control via a highly realistic dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4 reveal-up delay-300">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 neo-button rounded-full text-black font-bold text-base text-center">
                Get in touch
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-[#171717] border border-white/10 rounded-full text-white font-semibold text-base transition-all hover:bg-[#262626] text-center">
                View Live Demo
              </a>
            </div>
          </div>

          {/* Right Visual - Realistic UI Mockup */}
          <div className="flex-1 w-full relative reveal-up delay-400 mt-8 xl:mt-0">
            <div className="floating">
              <div className="w-full max-w-2xl mx-auto bg-[#121212] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
              
              {/* Fake UI Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#171717] flex items-center justify-center text-[#CCFF00]">
                    <IconParking className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Central Parking Tower</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Level 1 • Zone A</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-xs font-bold">Level 1</div>
                  <div className="px-3 py-1 rounded-full bg-[#171717] text-gray-400 text-xs font-semibold">Level 2</div>
                </div>
              </div>

              {/* Main Fake UI Body */}
              <div className="p-6 flex flex-col md:flex-row gap-6">
                
                {/* Slot Grid Left */}
                <div className="flex-1 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 tracking-wider">CHOOSE A PARKING SPOT</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Spot 1: Available */}
                    <div className="h-24 rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center relative hover:border-gray-500 transition-colors cursor-pointer group">
                      <span className="text-gray-600 font-mono text-sm -rotate-90 absolute left-2">P1-04</span>
                      <IconParking className="w-6 h-6 text-gray-600 group-hover:text-gray-400" />
                    </div>

                    {/* Spot 2: Booked (Stripes) */}
                    <div className="h-24 rounded-xl stripe-bg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <IconLock className="w-5 h-5 text-[#CCFF00] mb-1" />
                        <span className="text-[#CCFF00] text-xs font-bold bg-black/60 px-2 py-0.5 rounded">Booking</span>
                      </div>
                    </div>

                    {/* Spot 3: Occupied (Car Image inside) */}
                    <div className="h-24 rounded-xl border border-white/10 bg-[#1A1A1A] flex items-center justify-center relative overflow-hidden">
                       <span className="text-gray-600 font-mono text-sm -rotate-90 absolute left-2 z-10">P1-06</span>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
                         <IconCar />
                       </div>
                    </div>

                    {/* Spot 4: Selected */}
                    <div className="h-24 rounded-xl border-2 border-[#CCFF00] bg-[#CCFF00]/10 flex flex-col items-center justify-center relative shadow-[0_0_15px_rgba(204,255,0,0.15)]">
                      <span className="text-[#CCFF00] font-mono text-sm -rotate-90 absolute left-2">P1-07</span>
                      <div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-pulse" />
                    </div>
                  </div>

                  {/* Timeslot picker mock */}
                  <div className="pt-4">
                    <h4 className="text-xs font-semibold text-gray-400 tracking-wider mb-3">PICK AVAILABLE TIMESLOT</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {['08:00', '09:00', '10:00', '11:00'].map((time, i) => (
                        <div key={i} className={`text-center py-2 rounded-lg text-xs font-bold cursor-pointer ${i === 2 ? 'bg-[#CCFF00] text-black' : 'bg-[#171717] text-gray-400 hover:bg-[#262626] border border-white/5'}`}>
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Realistic Image Card */}
                <div className="w-full md:w-2/5 rounded-2xl overflow-hidden relative border border-white/10 group">
                  <Image 
                    src="https://images.unsplash.com/photo-1600320254374-ce2d293c324e?q=80&w=800&auto=format&fit=crop"
                    alt="Parking Garage Live View"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* HUD Overlay */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10">
                    <div className="w-16 h-12 bg-gray-800 rounded flex items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 100 50" className="w-full h-full stroke-[#CCFF00] fill-none opacity-50">
                        <path d="M0,25 Q25,5 50,25 T100,25" strokeWidth="2" />
                      </svg>
                      <div className="absolute w-2 h-2 bg-[#CCFF00] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#CCFF00]" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[#CCFF00] text-3xl font-bold font-mono">200m</div>
                        <div className="text-white text-xs font-semibold">Distance to Slot</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xl font-bold font-mono">10<span className="text-xs text-gray-400 ml-1">mph</span></div>
                        <div className="text-gray-400 text-[10px] uppercase">Speed Limit</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            </div>
            
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[500px] bg-[#CCFF00]/10 blur-[80px] rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-24 relative bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 relative order-2 lg:order-1 reveal-up">
              <div className="relative rounded-3xl overflow-hidden border border-white/10" style={{ aspectRatio: "4/3" }}>
                <Image 
                  src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=2000&auto=format&fit=crop"
                  alt="Automated Parking Validation"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-8 left-8 bg-[#171717]/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl max-w-sm">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                      <IconShield />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Secure Access</h4>
                      <p className="text-gray-400 text-xs">Role-Based Access Control</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2 reveal-up delay-100">
              <h2 className="text-3xl lg:text-4xl md:text-5xl font-bold mb-6 font-[Outfit] text-white">Built to eliminate <span className="text-[#CCFF00]">parking friction</span></h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                The Smart Parking Management System (SPMS) bridges the gap between digital convenience and real-world logistics. Whether you are an operator managing hundreds of slots or a driver securing a spot.
              </p>
              <ul className="space-y-5">
                {[
                  "Guaranteed 99% System Uptime",
                  "Automated Cryptographic Security",
                  "Real-time Live Grid Monitoring",
                  "Dynamic Tiered Billing System"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-300 font-medium bg-[#171717] px-5 py-4 rounded-xl border border-white/5 hover:border-[#CCFF00]/30 transition-colors">
                    <IconCheck /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 relative border-t border-white/5 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-[Outfit] text-white">Complete Management Suite</h2>
            <p className="text-gray-400 text-lg">Everything operators and users need within one unified dark-themed dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <IconCamera />,
                title: "Live Slot Management",
                desc: "A realistic visual grid manages the full lifecycle of slots from initial configuration to real-time tracking.",
              },
              {
                icon: <IconChart />,
                title: "Analytics & Reports",
                desc: "Aggregate transactional data to produce utilization and revenue reports. Exportable to PDF instantly.",
              },
              {
                icon: <IconShield />,
                title: "Secure Reservations",
                desc: "Book slots up to 30 days in advance. Advanced conflict detection prevents any double-booking scenarios.",
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-[#171717] border border-white/5 p-8 rounded-2xl hover:bg-[#1A1A1A] transition-all hover:-translate-y-2 hover:border-[#CCFF00]/40 group reveal-up"
                style={{ animationDelay: `${(i+1)*100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 bg-[#CCFF00]/10 text-[#CCFF00]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-24 relative border-t border-white/5 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-[Outfit] text-white">Transparent <span className="text-[#CCFF00]">Pricing Rules</span></h2>
            <p className="text-gray-400 text-lg">Automated billing directly upon check-out, respecting our unified tiered rates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-5xl mx-auto">
            {/* Motorcycle */}
            <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl text-center reveal-up hover:-translate-y-4 hover:border-[#CCFF00]/40 transition-all cursor-pointer group">
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#CCFF00] transition-colors">Motorcycle</h3>
              <div className="text-4xl font-bold text-[#CCFF00] mb-2">$1.00<span className="text-lg text-gray-500 font-normal">/hr</span></div>
              <p className="text-sm text-gray-400 mb-6 border-b border-white/10 pb-6 group-hover:border-white/20 transition-colors">50% multiplier applied</p>
              <ul className="space-y-4 text-sm text-gray-300 mb-8 text-left">
                <li className="flex items-center gap-3"><IconCheck /> Daily cap at $7.50</li>
                <li className="flex items-center gap-3"><IconCheck /> Partial hour rounding</li>
              </ul>
              <Link href="/signup" className="block w-full py-4 bg-[#171717] border border-white/10 text-white rounded-xl font-bold transition-all group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-[#CCFF00]">
                Select Plan
              </Link>
            </div>

            {/* Standard Tier */}
            <div className="bg-[#171717] border border-[#CCFF00] p-10 rounded-3xl text-center relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(204,255,0,0.1)] reveal-up delay-100 hover:md:-translate-y-6 hover:shadow-[0_0_40px_rgba(204,255,0,0.2)] transition-all cursor-pointer group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Standard Vehicle</h3>
              <div className="text-5xl font-bold text-[#CCFF00] mb-2">$2.00<span className="text-lg text-gray-500 font-normal">/hr</span></div>
              <p className="text-sm text-gray-400 mb-6 border-b border-white/10 pb-6">First 3 hours, then $1.50/hr</p>
              <ul className="space-y-4 text-sm text-gray-300 mb-8 text-left">
                <li className="flex items-center gap-3"><IconCheck /> Maximum cap of $15.00</li>
                <li className="flex items-center gap-3"><IconCheck /> Instant digital receipt</li>
                <li className="flex items-center gap-3"><IconCheck /> Advanced 30-day booking</li>
              </ul>
              <Link href="/signup" className="block w-full py-4 neo-button rounded-xl font-bold">
                Book Slot Now
              </Link>
            </div>

            {/* Large Tier */}
            <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl text-center reveal-up delay-200 hover:-translate-y-4 hover:border-[#CCFF00]/40 transition-all cursor-pointer group">
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#CCFF00] transition-colors">Large Vehicle</h3>
              <div className="text-4xl font-bold text-[#CCFF00] mb-2">$3.00<span className="text-lg text-gray-500 font-normal">/hr</span></div>
              <p className="text-sm text-gray-400 mb-6 border-b border-white/10 pb-6 group-hover:border-white/20 transition-colors">150% multiplier applied</p>
              <ul className="space-y-4 text-sm text-gray-300 mb-8 text-left">
                <li className="flex items-center gap-3"><IconCheck /> Daily cap at $22.50</li>
                <li className="flex items-center gap-3"><IconCheck /> Accommodates SUVs</li>
              </ul>
              <Link href="/signup" className="block w-full py-4 bg-[#171717] border border-white/10 text-white rounded-xl font-bold transition-all group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-[#CCFF00]">
                Select Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="py-24 relative border-t border-white/5 bg-[#121212]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center reveal-up">
          <div className="w-16 h-16 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#CCFF00]">
            <IconMail />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-[Outfit] text-white">Ready to upgrade your parking?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Get in touch with our team to schedule a detailed deployment plan or request a live demonstration of our administrative dashboard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your work email" 
              className="px-6 py-4 bg-[#0A0A0A] border border-white/10 rounded-full w-full text-white focus:outline-none focus:border-[#CCFF00] transition-colors"
            />
            <button className="px-8 py-4 neo-button rounded-full font-bold whitespace-nowrap">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-white/10 bg-[#0A0A0A]">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <IconParking className="w-6 h-6 text-[#CCFF00]" />
            <span className="font-bold text-white tracking-wider">SPMS</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
          </div>

          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} SPMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
