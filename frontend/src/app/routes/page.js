import dynamic from "next/dynamic";
import { Navigation } from "lucide-react";

const RouteClient = dynamic(() => import("./RouteClient"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft">
        <div className="flex items-center space-x-2">
          <Navigation className="w-6 h-6 text-burgundy-900" />
          <h1 className="text-2xl font-bold text-navy-900">Risk-Aware Safe Route Planner</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Loading dynamic A* pathfinding over Nagpur road networks...
        </p>
      </div>

      <div className="relative bg-slate-900 rounded-card border border-slate-200 shadow-card-soft h-[560px] flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <Navigation className="w-10 h-10 text-rose-300 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold">Initializing Safe Routing Map...</h2>
          <p className="text-sm text-slate-400">Loading OSMnx road network & flood risk weights</p>
        </div>
      </div>
    </div>
  ),
});

export default function RoutesPage() {
  return <RouteClient />;
}
