"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Compass,
  ChevronDown,
  Mail,
  CheckCircle2,
  FileText,
  Navigation,
  X,
} from "lucide-react";

import { NagDrishtiEyeIcon } from "../components/NagDrishtiLogo";

export default function NavbarClient() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, logout, loading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Robust display name fallback
  const citizenName =
    user?.name ||
    user?.full_name ||
    user?.first_name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Citizen";

  const adminName =
    user?.name ||
    user?.full_name ||
    user?.username ||
    user?.first_name ||
    "nmc_admin";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <NagDrishtiEyeIcon size="w-10 h-10" iconSize="w-7 h-7" className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-lg tracking-tight text-navy-900 block leading-none">
                  Nag<span className="text-sky-500">Drishti</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-md shadow-sm">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">
                Urban Crisis Intelligence
              </span>
            </div>
          </Link>

          {/* Right Navigation & Auth Actions */}
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : !isAuthenticated ? (
              /* Public / Unauthenticated state: ONLY show single "Login" button */
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition hover:translate-y-[-1px]"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-300" />
                <span>Login</span>
              </Link>
            ) : role === "admin" ? (
              /* Official Municipal Admin Navigation */
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin-hub"
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    pathname.startsWith("/admin-hub")
                      ? "bg-burgundy-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
                  <span>Admin Command Hub</span>
                </Link>

                {/* Direct Link to Django Built-in DB Admin */}
                <a
                  href="http://127.0.0.1:8000/admin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition"
                  title="Open Django Database Admin in new tab"
                >
                  <span>Django DB Admin ↗</span>
                </a>

                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-burgundy-50 border border-burgundy-200 rounded-xl text-xs font-semibold text-burgundy-900">
                  <span className="w-2 h-2 rounded-full bg-burgundy-900 animate-pulse"></span>
                  <span>Admin: {adminName}</span>
                </div>

                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              /* Citizen Account Navigation */
              <div className="relative flex items-center space-x-3">
                <Link
                  href="/citizen-portal"
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    pathname.startsWith("/citizen-portal")
                      ? "bg-navy-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Citizen Portal</span>
                </Link>

                {/* Interactive Citizen Profile Badge */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 transition shadow-xs cursor-pointer"
                    title="Click to view your Citizen Profile"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {citizenName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">Citizen: {citizenName}</span>
                    <ChevronDown className={`w-3 h-3 text-emerald-700 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Citizen Profile Dropdown Popover */}
                  {profileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 z-50 animate-in zoom-in-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Popover Header */}
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                            {citizenName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-navy-900">{citizenName}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                              {user?.email || "Nagpur Resident"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setProfileOpen(false)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Citizen Account Info */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1.5 text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Account Type:</span>
                          <span className="font-bold text-emerald-700">Citizen Resident</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Status:</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Verified
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Resident Zone:</span>
                          <span className="font-semibold text-slate-800">Nagpur Central</span>
                        </div>
                      </div>

                      {/* Quick Shortcuts */}
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <Link
                          href="/citizen-portal"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2 w-full p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-navy-900 transition"
                        >
                          <Compass className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Citizen Disaster Dashboard</span>
                        </Link>
                        <Link
                          href="/report"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2 w-full p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-navy-900 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          <span>Report Waterlogging / Hazard</span>
                        </Link>
                        <Link
                          href="/routes"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2 w-full p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-navy-900 transition"
                        >
                          <Navigation className="w-3.5 h-3.5 text-sky-500" />
                          <span>AI Safe Route Planner</span>
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full mt-2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-rose-200"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
