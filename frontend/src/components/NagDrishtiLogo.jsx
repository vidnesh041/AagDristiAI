import React from "react";

export function NagDrishtiEyeIcon({ size = "w-10 h-10", iconSize = "w-7 h-7", className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 shadow-md shadow-sky-500/10 ${size} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={iconSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radar Waves / Crosshairs */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="opacity-40"
        />
        <line x1="50" y1="6" x2="50" y2="16" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="84" x2="50" y2="94" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="50" x2="16" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="84" y1="50" x2="94" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

        {/* Drishti (Vision Eye Aperture) */}
        <path
          d="M 12 50 Q 50 18 88 50 Q 50 82 12 50 Z"
          stroke="url(#blueOrangeGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Core AI Sensor / Pupil */}
        <circle cx="50" cy="50" r="14" fill="#0b1329" stroke="#ea580c" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="6" fill="#f59e0b" />
        <circle cx="48" cy="48" r="1.8" fill="#ffffff" />

        <defs>
          <linearGradient id="blueOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Backward compatibility alias
export const NagNetraEyeIcon = NagDrishtiEyeIcon;

export default function NagDrishtiLogo({
  className = "",
  theme = "dark", // "dark" for dark backgrounds, "light" for white/light navbars
  showTelemetry = true,
}) {
  const isLight = theme === "light";

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Dynamic Vision & Spatial Icon (Drishti Eye Portion) */}
      <NagDrishtiEyeIcon size="w-11 h-11" iconSize="w-8 h-8" />

      {/* Brand Wordmark & AI Badge */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`text-xl sm:text-2xl font-black tracking-tight font-sans ${
              isLight ? "text-navy-900" : "text-white"
            }`}
          >
            Nag<span className="text-sky-500">Drishti</span>
          </span>
          <span className="px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-md shadow-sm">
            AI
          </span>
        </div>
        <span
          className={`text-[9px] font-bold tracking-widest uppercase mt-1 ${
            isLight ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Urban Crisis & Mobility Intelligence
        </span>
        {showTelemetry && (
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[8px] font-medium tracking-wide text-emerald-500 uppercase">
              Nagpur City Real-Time Telemetry
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
