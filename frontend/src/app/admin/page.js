import dynamic from "next/dynamic";
import { ShieldAlert } from "lucide-react";

const AdminClient = dynamic(() => import("./AdminClient"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="bg-navy-900 text-white p-6 rounded-card border border-navy-800 shadow-card-soft">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          <h1 className="text-2xl font-bold">Municipal Disaster Command Hub</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Loading live priority queues, Twilio alert logs, and citizen reports...
        </p>
      </div>

      <div className="bg-white rounded-card border border-slate-200 shadow-card-soft h-96 flex items-center justify-center">
        <div className="text-center space-y-2 text-slate-500">
          <ShieldAlert className="w-10 h-10 text-burgundy-900 mx-auto animate-pulse" />
          <p className="text-sm font-semibold text-navy-900">Synchronizing Command Hub Data...</p>
        </div>
      </div>
    </div>
  ),
});

export const metadata = {
  title: "Admin Command Hub — NagDrishtiAI",
  description: "Municipal disaster priority queue, field squad dispatch, and Twilio alert audits powered by NagDrishtiAI.",
};

export default function AdminPage() {
  return <AdminClient />;
}
