import Link from "next/link";
import { AlertTriangle, Home, Map, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-card border border-slate-200 shadow-card-soft">
        <div className="w-16 h-16 rounded-2xl bg-burgundy-50 border border-burgundy-200 flex items-center justify-center text-burgundy-900 mx-auto">
          <AlertTriangle className="w-8 h-8 text-burgundy-800" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">404 - Page Not Found</h1>
          <p className="text-sm text-slate-500">
            The requested crisis monitoring route does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition"
          >
            <Home className="w-4 h-4" />
            <span>Crisis Home</span>
          </Link>

          <Link
            href="/map"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-burgundy-900 text-white text-xs font-semibold hover:bg-burgundy-800 transition shadow-glow-burgundy"
          >
            <Map className="w-4 h-4" />
            <span>Ward Heatmap</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
