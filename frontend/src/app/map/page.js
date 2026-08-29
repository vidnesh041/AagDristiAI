import dynamic from "next/dynamic";
import { Layers } from "lucide-react";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-burgundy-700 animate-pulse"></span>
          <h1 className="text-2xl font-bold text-navy-900">Nagpur Ward Risk Heatmap</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Loading real-time geospatial hazard classification across Nagpur wards...
        </p>
      </div>

      <div className="relative bg-slate-900 rounded-card border border-slate-200 shadow-card-soft h-[620px] flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="w-12 h-12 rounded-xl bg-burgundy-900/70 border border-burgundy-700 flex items-center justify-center mx-auto text-rose-200 animate-pulse">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Initializing Interactive Map...</h2>
          <p className="text-sm text-slate-400">Loading Leaflet OpenStreetMap tiles & PostGIS polygons</p>
        </div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <MapClient />;
}