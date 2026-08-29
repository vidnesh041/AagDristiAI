"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import dynamic from "next/dynamic";
import {
  Map as MapIcon,
  Navigation,
  FileText,
  ShieldCheck,
  LogOut,
  User,
  Loader2,
  LogIn,
} from "lucide-react";

// Dynamically import client components SSR-safe
const MapClient = dynamic(() => import("../map/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-white rounded-card border border-slate-200 shadow-card-soft flex items-center justify-center text-slate-500 text-xs">
      Loading Nagpur Ward Risk Heatmap Canvas...
    </div>
  ),
});

const RouteClient = dynamic(() => import("../routes/RouteClient"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-white rounded-card border border-slate-200 shadow-card-soft flex items-center justify-center text-slate-500 text-xs">
      Loading AI Route Planner...
    </div>
  ),
});

const ReportClient = dynamic(() => import("../report/ReportClient"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-white rounded-card border border-slate-200 shadow-card-soft flex items-center justify-center text-slate-500 text-xs">
      Loading Hazard Reporting Engine...
    </div>
  ),
});

export default function CitizenPortalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("map");
  const [localUser, setLocalUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Read directly from localStorage on mount
    try {
      const savedToken = localStorage.getItem("nagpur_crisis_token");
      const savedUser = localStorage.getItem("nagpur_crisis_user");
      if (savedToken && savedUser) {
        setLocalUser(JSON.parse(savedUser));
        setChecking(false);
      } else {
        // No session -> redirect to login after short grace period
        const timer = setTimeout(() => {
          router.push("/login");
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("Storage check exception", e);
      router.push("/login");
    } finally {
      setChecking(false);
    }
  }, [router]);

  const activeUser = user || localUser;

  if (checking) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3 text-slate-600">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-semibold">Validating Citizen Access Credentials...</p>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <LogIn className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-navy-900">Sign In Required</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Please sign in with Google, Magic Link, or your credentials to access the Nagpur Citizen Disaster Portal.
          </p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="py-2.5 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md transition"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const displayName =
    activeUser?.name ||
    activeUser?.full_name ||
    activeUser?.first_name ||
    activeUser?.username ||
    activeUser?.email?.split("@")[0] ||
    "Citizen Resident";

  return (
    <div className="space-y-6">
      {/* Citizen Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 text-white p-6 sm:p-8 rounded-card-lg border border-navy-800 shadow-card-soft">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NAGDRISHTI-AI CITIZEN DISASTER PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time urban flood risk heatmaps, AI-safe travel routes bypassing submerged corridors, and instant hazard reporting.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 bg-white/10 rounded-xl border border-white/20 text-xs text-slate-200">
            <span className="text-emerald-400 font-bold">● Live:</span> 10 Wards Monitored
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Citizen Profile & Emergency Information Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-card border border-slate-200 shadow-card-soft text-xs">
        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase font-bold text-slate-400">Citizen Name</div>
            <div className="font-bold text-navy-900 truncate">{displayName}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
            @
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
            <div className="font-medium text-slate-700 truncate">{activeUser?.email || "Registered Resident"}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            ✓
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Account Role</div>
            <div className="font-bold text-emerald-700">Citizen Resident (Verified)</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
            🚨
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-600">NMC Emergency SOS</div>
            <div className="font-black text-rose-900 font-mono">1077 / 0712-2567011</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-card border border-slate-200 shadow-card-soft">
        <button
          onClick={() => setActiveTab("map")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === "map"
              ? "bg-navy-900 text-white shadow-sm"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <MapIcon className="w-4 h-4 text-emerald-400" />
          <span>1. Ward Risk Heatmap</span>
        </button>

        <button
          onClick={() => setActiveTab("routes")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === "routes"
              ? "bg-navy-900 text-white shadow-sm"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Navigation className="w-4 h-4 text-rose-300" />
          <span>2. Safe Route Planner (A*)</span>
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === "report"
              ? "bg-navy-900 text-white shadow-sm"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4 text-amber-300" />
          <span>3. Report Road Hazard (AI Vision)</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === "map" && <MapClient />}
        {activeTab === "routes" && <RouteClient />}
        {activeTab === "report" && <ReportClient />}
      </div>
    </div>
  );
}
