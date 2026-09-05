import React from 'react';
import { Home, Sparkles, Building2, MapPin, Compass } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#111827] via-[#1E293B] to-slate-900 text-white shadow-lg mb-6 border border-slate-700/60">
      {/* Background Architectural Vector Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 240" fill="none" preserveAspectRatio="none">
          {/* Skyline Silhouettes */}
          <rect x="50" y="80" width="70" height="160" fill="currentColor" />
          <rect x="130" y="50" width="85" height="190" fill="currentColor" />
          <rect x="230" y="100" width="60" height="140" fill="currentColor" />
          <rect x="310" y="40" width="100" height="200" fill="currentColor" />
          <rect x="430" y="70" width="75" height="170" fill="currentColor" />
          <rect x="520" y="30" width="110" height="210" fill="currentColor" />
          <rect x="650" y="60" width="80" height="180" fill="currentColor" />
          <rect x="750" y="90" width="65" height="150" fill="currentColor" />
          <rect x="830" y="45" width="95" height="195" fill="currentColor" />
          <rect x="940" y="85" width="80" height="155" fill="currentColor" />
          <rect x="1040" y="35" width="120" height="205" fill="currentColor" />
          <line x1="0" y1="230" x2="1200" y2="230" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative px-6 py-6 sm:px-8 sm:py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Single Singapore Citizen (SSC) Scheme • Empirical 5-Yr Model</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            For Singles Age 35 : HDB Housing Strategy Calculator
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
            Empirical 5-year forecasting and cash flow feasibility mapping across multiple housing configurations.
          </p>
        </div>

        {/* Quick Highlights Pill Badges */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 text-xs font-medium">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span>MAS 4.0% Stress Test MSR (30%) & TDSR (55%)</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            <span>BTO vs Resale vs Renting Wealth Modeling</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            <span>SLA Bala's Lease Depreciation Curve (40y–95y)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
