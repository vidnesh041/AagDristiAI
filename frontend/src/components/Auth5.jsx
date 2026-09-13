"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import NagDrishtiLogo from "./NagDrishtiLogo";
import SpecularButton from "./SpecularButton";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Loader2,
} from "lucide-react";

export default function Auth5({ className = "" }) {
  const {
    login,
    register,
    signInWithGoogle,
    nmcLogin,
    sendMagicLink,
    verifyMagicLink,
  } = useAuth();
  const searchParams = useSearchParams();

  // Tab: "signin" | "signup" | "magic_link" | "nmc_sso"
  const [tab, setTab] = useState("signin");
  // State for Magic Link: "form" | "inbox"
  const [inboxState, setInboxState] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [magicCode, setMagicCode] = useState("");

  // NMC SSO Fields
  const [nmcOfficerId, setNmcOfficerId] = useState("");
  const [nmcOfficerName, setNmcOfficerName] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [urlVerifying, setUrlVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Automatic One-Click Verification if opened from Email Link (?token=...&email=...)
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");

    if (tokenFromUrl) {
      setUrlVerifying(true);
      verifyMagicLink(emailFromUrl || "", tokenFromUrl, true).then((res) => {
        setUrlVerifying(false);
        if (!res.success) {
          setErrorMsg(res.error || "Magic sign-in link expired or invalid.");
        }
      });
    }
  }, [searchParams]);

  // Cooldown timer ticker
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Real Email & Password Sign In
  const handleSignIn = async (e) => {
    e?.preventDefault();
    setErrorMsg("");
    setSuccessNotice("");
    setLoading(true);

    const res = await login(email.trim(), password);
    if (!res.success) {
      const err = res.error || "";
      if (
        err.toLowerCase().includes("invalid login credentials") ||
        err.toLowerCase().includes("invalid credentials") ||
        err.toLowerCase().includes("invalid email or password")
      ) {
        setErrorMsg("Invalid Email / Password");
      } else {
        setErrorMsg(err || "Invalid Email / Password");
      }
      setLoading(false);
    }
  };

  // Real Supabase Account Sign Up
  const handleSignUp = async (e) => {
    e?.preventDefault();
    setErrorMsg("");
    setSuccessNotice("");
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);

    const res = await register({
      email: email.trim(),
      password,
      name: fullName.trim() || email.split("@")[0],
      role: selectedRole,
    });

    if (!res.success) {
      setErrorMsg(res.error || "Sign-up failed. Please check your information.");
      setLoading(false);
    }
  };

  // Real Supabase Google OAuth (Redirects to official Google consent flow)
  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setErrorMsg(res.error || "Failed to initiate Google authentication.");
      setGoogleLoading(false);
    }
  };

  // Official NMC Disaster Officer Login
  const handleNmcSignIn = async (e) => {
    e?.preventDefault();
    if (!nmcOfficerId.trim()) {
      setErrorMsg("Please enter your official NMC Employee ID.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    const res = await nmcLogin(nmcOfficerId.trim(), nmcOfficerName.trim());
    if (!res.success) {
      setErrorMsg(res.error || "NMC Officer verification failed.");
      setLoading(false);
    }
  };

  // Magic Link Dispatch
  const handleMagicLinkSend = async (e) => {
    e?.preventDefault();
    setErrorMsg("");
    setSuccessNotice("");
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    const res = await sendMagicLink(email.trim());
    setLoading(false);
    if (res.success) {
      setInboxState(true);
      setSuccessNotice(`Verification link and 6-digit code dispatched to ${email}.`);
      setCooldown(30);
    } else {
      setErrorMsg(res.error || "Failed to dispatch magic email.");
    }
  };

  // Magic Link Verify OTP
  const handleVerifyMagicCode = async (e) => {
    e?.preventDefault();
    setErrorMsg("");
    if (!magicCode || magicCode.length < 6) {
      setErrorMsg("Please enter the 6-digit code sent to your email.");
      return;
    }
    setLoading(true);

    const res = await verifyMagicLink(email.trim(), magicCode.trim(), false);
    if (!res.success) {
      setErrorMsg(res.error || "Invalid or expired verification code.");
      setLoading(false);
    }
  };

  const handleResendMagicLink = async () => {
    if (cooldown > 0) return;
    setErrorMsg("");
    setLoading(true);
    const res = await sendMagicLink(email.trim());
    setLoading(false);
    if (res.success) {
      setSuccessNotice(`New email dispatched to ${email}.`);
      setCooldown(30);
    } else {
      setErrorMsg(res.error || "Failed to resend email.");
    }
  };

  if (urlVerifying) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-card-lg border border-slate-200 shadow-2xl text-center space-y-4">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-navy-900">Verifying secure sign-in link...</h2>
        <p className="text-xs text-slate-500">Signing you into NagDrishtiAI Platform</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Brand Header Banner */}
      <div className="mb-4 bg-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-center">
        <NagDrishtiLogo theme="dark" showTelemetry={true} />
      </div>

      {/* Main Authentication Card */}
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-md p-4 sm:p-7 rounded-card-lg border border-slate-200/90 shadow-2xl">
        {/* Navigation Tabs (Sign In / Create Account) */}
        {!inboxState && tab !== "magic_link" && tab !== "nmc_sso" && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMsg("");
                setSuccessNotice("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                tab === "signin"
                  ? "bg-white text-navy-900 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMsg("");
                setSuccessNotice("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                tab === "signup"
                  ? "bg-white text-navy-900 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* TAB 1: REAL SIGN IN (EMAIL & PASSWORD)                                   */}
          {/* ========================================================================= */}
          {tab === "signin" && !inboxState && (
            <motion.div
              key="signin-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-navy-900 tracking-tight">Welcome Back</h1>
                <p className="text-xs text-slate-500">Sign in to your NagDrishtiAI crisis portal</p>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Notice */}
              {successNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("magic_link");
                        setErrorMsg("");
                      }}
                      className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold"
                    >
                      Forgot? Use Magic Link
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <div className="pt-1">
                  <SpecularButton
                    type="submit"
                    disabled={loading || googleLoading}
                    size="md"
                    radius={14}
                    tint="#0f172a"
                    tintOpacity={1}
                    blur={0}
                    textColor="#ffffff"
                    lineColor="#38bdf8"
                    baseColor="#0369a1"
                    intensity={1.3}
                    shineSize={18}
                    shineFade={35}
                    thickness={1.4}
                    speed={0.4}
                    followMouse={true}
                    proximity={220}
                    className="w-full !py-3 shadow-md"
                  >
                    <div className="flex items-center justify-center space-x-2 font-bold text-xs">
                      {loading ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 text-sky-300" />
                          <span>Sign In to Portal</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </div>
                  </SpecularButton>
                </div>
              </form>

              {/* OAuth Providers Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  or sign in with
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Direct Supabase OAuth Buttons (No Fake Popups) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading || googleLoading}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-sm hover:border-slate-300 hover:shadow"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab("nmc_sso");
                    setErrorMsg("");
                  }}
                  disabled={loading || googleLoading}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-burgundy-200 bg-burgundy-50/50 hover:bg-burgundy-100/60 text-xs font-semibold text-burgundy-900 transition shadow-sm hover:border-burgundy-300"
                >
                  <ShieldCheck className="w-4 h-4 text-burgundy-800 flex-shrink-0" />
                  <span>NMC Govt SSO</span>
                </button>
              </div>

              {/* Passwordless Magic Link Shortcut */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("magic_link");
                    setErrorMsg("");
                  }}
                  className="text-xs text-slate-500 hover:text-navy-900 font-medium flex items-center justify-center gap-1.5 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sign in without password via Magic Email Link</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REAL SIGN UP (CREATE ACCOUNT WITH SUPABASE)                        */}
          {/* ========================================================================= */}
          {tab === "signup" && !inboxState && (
            <motion.div
              key="signup-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-navy-900 tracking-tight">Create Account</h1>
                <p className="text-xs text-slate-500">Register as a Nagpur resident or emergency officer</p>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition outline-none"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your personal or official email"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("citizen")}
                      className={`p-2.5 rounded-xl border text-left transition text-xs ${
                        selectedRole === "citizen"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Citizen Portal</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`p-2.5 rounded-xl border text-left transition text-xs ${
                        selectedRole === "admin"
                          ? "bg-burgundy-50 border-burgundy-400 text-burgundy-900 font-bold ring-1 ring-burgundy-400"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-burgundy-800" />
                        <span>NMC Officer</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Submit Sign Up */}
                <div className="pt-1">
                  <SpecularButton
                    type="submit"
                    disabled={loading || googleLoading}
                    size="md"
                    radius={14}
                    tint="#0f172a"
                    tintOpacity={1}
                    blur={0}
                    textColor="#ffffff"
                    lineColor="#10b981"
                    baseColor="#065f46"
                    intensity={1.3}
                    shineSize={18}
                    shineFade={35}
                    thickness={1.4}
                    speed={0.4}
                    followMouse={true}
                    proximity={220}
                    className="w-full !py-3 shadow-md"
                  >
                    <div className="flex items-center justify-center space-x-2 font-bold text-xs">
                      {loading ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-emerald-300" />
                          <span>Create Free Account</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </div>
                  </SpecularButton>
                </div>
              </form>

              {/* Alternative Authentication Options on Create Account */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  or sign up with
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Direct Supabase OAuth Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading || googleLoading}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-sm hover:border-slate-300 hover:shadow"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab("nmc_sso");
                    setErrorMsg("");
                  }}
                  disabled={loading || googleLoading}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-burgundy-200 bg-burgundy-50/50 hover:bg-burgundy-100/60 text-xs font-semibold text-burgundy-900 transition shadow-sm hover:border-burgundy-300"
                >
                  <ShieldCheck className="w-4 h-4 text-burgundy-800 flex-shrink-0" />
                  <span>NMC Govt SSO</span>
                </button>
              </div>

              {/* Passwordless Magic Link Quick Action */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("magic_link");
                    setErrorMsg("");
                  }}
                  className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center justify-center gap-1.5 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Or sign up without a password using Magic Email Link</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: NMC MUNICIPAL OFFICER SSO TAB                                     */}
          {/* ========================================================================= */}
          {tab === "nmc_sso" && (
            <motion.div
              key="nmc-sso-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setErrorMsg("");
                  }}
                  className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span className="text-[10px] font-mono font-bold uppercase text-burgundy-700 bg-burgundy-100 px-2 py-0.5 rounded-full">
                  NMC Official SSO
                </span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-burgundy-100 text-burgundy-900 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-navy-900">Municipal Officer Login</h2>
                <p className="text-xs text-slate-500">
                  Nagpur Municipal Corporation Emergency Control System
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleNmcSignIn} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Official Employee ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nmcOfficerId}
                      onChange={(e) => setNmcOfficerId(e.target.value)}
                      placeholder="e.g. NMC-DISASTER-704"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition outline-none font-mono"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Officer Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nmcOfficerName}
                      onChange={(e) => setNmcOfficerName(e.target.value)}
                      placeholder="e.g. Inspector R. Deshmukh"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition outline-none"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-1">
                  <SpecularButton
                    type="submit"
                    disabled={loading}
                    size="md"
                    radius={14}
                    tint="#4c0519"
                    tintOpacity={1}
                    blur={0}
                    textColor="#ffffff"
                    lineColor="#f43f5e"
                    baseColor="#881337"
                    intensity={1.3}
                    shineSize={18}
                    shineFade={35}
                    thickness={1.4}
                    speed={0.4}
                    followMouse={true}
                    proximity={220}
                    className="w-full !py-3 shadow-md"
                  >
                    <div className="flex items-center justify-center space-x-2 font-bold text-xs">
                      {loading ? (
                        <span>Verifying Official ID...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-rose-300" />
                          <span>Authorize NMC Command Access</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </div>
                  </SpecularButton>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PASSWORDLESS MAGIC EMAIL LINK                                      */}
          {/* ========================================================================= */}
          {tab === "magic_link" && !inboxState && (
            <motion.div
              key="magic-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setErrorMsg("");
                  }}
                  className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Password Login</span>
                </button>
              </div>

              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-navy-900">Passwordless Magic Link</h2>
                <p className="text-xs text-slate-500">
                  Enter your email to receive an instant 1-click login link & 6-digit OTP code
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleMagicLinkSend} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-1">
                  <SpecularButton
                    type="submit"
                    disabled={loading}
                    size="md"
                    radius={14}
                    tint="#0f172a"
                    tintOpacity={1}
                    blur={0}
                    textColor="#ffffff"
                    lineColor="#f59e0b"
                    baseColor="#b45309"
                    intensity={1.3}
                    shineSize={18}
                    shineFade={35}
                    thickness={1.4}
                    speed={0.4}
                    followMouse={true}
                    proximity={220}
                    className="w-full !py-3 shadow-md"
                  >
                    <div className="flex items-center justify-center space-x-2 font-bold text-xs">
                      {loading ? (
                        <span>Sending Magic Link...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Send Secure Magic Link</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </div>
                  </SpecularButton>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CHECK YOUR INBOX / OTP VERIFICATION STATE                         */}
          {/* ========================================================================= */}
          {inboxState && (
            <motion.div
              key="inbox-view"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-navy-900">Check Your Inbox</h2>
                <p className="text-xs text-slate-500">
                  We sent a 1-click sign-in link and 6-digit code to:
                </p>
                <p className="text-xs font-bold text-navy-900 font-mono bg-slate-100 py-1 px-2 rounded-lg inline-block">
                  {email}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 text-left animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 6-Digit Code Input Form */}
              <form onSubmit={handleVerifyMagicCode} className="space-y-3 pt-2">
                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={magicCode}
                      onChange={(e) => setMagicCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full py-3 px-4 text-center tracking-[0.5em] font-mono font-bold text-lg rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition outline-none"
                    />
                  </div>
                </div>

                <SpecularButton
                  type="submit"
                  disabled={loading || magicCode.length < 6}
                  size="md"
                  radius={14}
                  tint="#0f172a"
                  tintOpacity={1}
                  blur={0}
                  textColor="#ffffff"
                  lineColor="#10b981"
                  baseColor="#065f46"
                  intensity={1.3}
                  shineSize={18}
                  shineFade={35}
                  thickness={1.4}
                  speed={0.4}
                  followMouse={true}
                  proximity={220}
                  className="w-full !py-3 shadow-md"
                >
                  <div className="flex items-center justify-center space-x-2 font-bold text-xs">
                    {loading ? (
                      <span>Verifying Code...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Confirm Code & Sign In</span>
                      </>
                    )}
                  </div>
                </SpecularButton>
              </form>

              {/* Resend Cooldown Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setInboxState(false);
                    setErrorMsg("");
                  }}
                  className="text-slate-500 hover:text-navy-900 font-semibold"
                >
                  ← Edit Email
                </button>

                <button
                  type="button"
                  onClick={handleResendMagicLink}
                  disabled={cooldown > 0 || loading}
                  className={`font-semibold ${
                    cooldown > 0
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-sky-600 hover:text-sky-700"
                  }`}
                >
                  {cooldown > 0 ? (
                    <span>Resend in {cooldown}s</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Resend Email
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center text-[11px] text-slate-400">
        <span>Protected by Supabase Auth &bull; Nagpur Municipal Corporation Standard</span>
      </div>
    </div>
  );
}
