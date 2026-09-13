"use client";

import { Suspense } from "react";
import Auth5 from "../../components/Auth5";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 bg-white rounded-card-lg border border-slate-200 shadow-xl text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading AAG Drishti AI Authentication...</p>
          </div>
        }
      >
        <Auth5 />
      </Suspense>
    </div>
  );
}
