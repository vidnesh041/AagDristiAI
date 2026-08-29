"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminClient from "../admin/AdminClient";
import { ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminHubPage() {
  const { user, role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      }
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500 text-xs font-semibold">
        Validating Municipal Command Hub Access...
      </div>
    );
  }

  // Strict Role Isolation: Non-admin citizens cannot access admin hub
  if (isAuthenticated && role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-card-lg border border-rose-200 shadow-card-soft text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 mx-auto flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-navy-900">403 — Access Restricted</h1>
          <p className="text-xs text-slate-600">
            The Municipal Command Hub is strictly restricted to official NMC emergency personnel. Your account ({user?.username}) has the <strong>Citizen</strong> role.
          </p>
          <div className="pt-2">
            <Link
              href="/citizen-portal"
              className="inline-flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Citizen Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminClient />;
}
