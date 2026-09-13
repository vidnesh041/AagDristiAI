"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/apiConfig";
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
  Map,
  Menu,
  X,
} from "lucide-react";

import { NagDrishtiEyeIcon } from "../components/NagDrishtiLogo";

export default function NavbarClient() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, logout, loading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Display names
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

  const navLinks = [
    { name: "Live Map", href: "/map", icon: Map },
    { name: "Safe Routes", href: "/routes", icon: Navigation },
    { name: "Report Hazard", href: "/report", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
            <NagDrishtiEyeIcon size="w-9 h-9 sm:w-10 sm:h-10" iconSize="w-6 h-6 sm:w-7 sm:h-7" className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-navy-900 leading-none">
                  Nag<span className="text-sky-500">Drishti</span>
                </span>
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-md shadow-xs">
                  AI
                </span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5 sm:mt-1 truncate max-w-[130px] sm:max-w-none">
                Urban Crisis Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs"
                      : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-sky-600" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Navigation & Auth Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {loading ? (
              <div className="w-16 sm:w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : !isAuthenticated ? (
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 bg-navy-900 hover:bg-navy-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition hover:translate-y-[-1px]"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-300" />
                <span>Login</span>
              </Link>
            ) : role === "admin" ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/admin-hub"
                  className={`inline-flex items-center space-x-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition ${
                    pathname.startsWith("/admin-hub")
                      ? "bg-burgundy-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
                  <span className="hidden sm:inline">Admin Command Hub</span>
                  <span className="sm:hidden">Admin</span>
                </Link>

                <a
                  href={`${API_BASE_URL}/admin/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition"
                  title="Open Django Database Admin in new tab"
                >
                  <span>Django DB ↗</span>
                </a>

                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="relative flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/citizen-portal"
                  className={`inline-flex items-center space-x-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition ${
                    pathname.startsWith("/citizen-portal")
                      ? "bg-navy-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Citizen Portal</span>
                  <span className="sm:hidden">Portal</span>
                </Link>

                {/* Profile Badge */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 transition shadow-xs cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {citizenName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] sm:max-w-[120px] truncate">{citizenName}</span>
                    <ChevronDown className={`w-3 h-3 text-emerald-700 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 z-50 animate-in zoom-in-95"
                      onClick={(e) => e.stopPropagation()}
                    >
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

                      <div className="space-y-1 pt-1">
                        <Link
                          href="/map"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2 w-full p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Map className="w-3.5 h-3.5 text-sky-500" />
                          <span>Interactive Hazard Map</span>
                        </Link>
                        <Link
                          href="/routes"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2 w-full p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Navigation className="w-3.5 h-3.5 text-sky-500" />
                          <span>AI Safe Route Planner</span>
                        </Link>
                        <Link
                          href="/report"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2 w-full p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          <span>Report Waterlogging / Hazard</span>
                        </Link>
                      </div>

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
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-sky-50 text-sky-700 border border-sky-200/80"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-sky-600" : "text-slate-400"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-navy-900 text-white font-bold text-xs shadow-sm"
                >
                  <LogIn className="w-4 h-4 text-rose-300" />
                  <span>Sign In / Create Account</span>
                </Link>
              ) : role === "admin" ? (
                <>
                  <Link
                    href="/admin-hub"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-burgundy-900 text-white font-bold text-xs shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-300" />
                    <span>Admin Command Hub</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/citizen-portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-navy-900 text-white font-bold text-xs shadow-sm"
                  >
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Citizen Disaster Portal</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out ({citizenName})</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
