"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SpecularButton from "../components/SpecularButton";
import VariableProximity from "../components/VariableProximity";
import ScrollExpand from "../components/ScrollExpand";
import {
  AlertTriangle,
  Map,
  Navigation,
  FileText,
  ArrowRight,
  ShieldCheck,
  CloudRain,
  Cpu,
  LogIn,
  Users,
  Building2,
  Compass,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const heroContainerRef = useRef(null);

  return (
    <div className="space-y-8 sm:space-y-12 py-2 sm:py-4">
      {/* Hero Section */}
      <section
        ref={heroContainerRef}
        className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 rounded-card-lg p-5 sm:p-8 lg:p-12 text-white border border-navy-700 shadow-card-soft"
      >
        <div className="relative z-10 max-w-3xl space-y-5 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 bg-burgundy-900/70 border border-burgundy-700/80 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-rose-200 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            <span>NAGDRISHTI-AI DISASTER INTELLIGENCE PLATFORM</span>
          </div>

          {/* Interactive Variable Proximity Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-50 select-none">
            <VariableProximity
              label="Predictive AI & Real-Time Urban Disaster Intelligence"
              className="text-slate-50 drop-shadow-sm"
              fromFontVariationSettings="'wght' 500, 'opsz' 14"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={heroContainerRef}
              radius={140}
              falloff="linear"
            />
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
            Combining real-time rainfall telemetry, topographic elevation, congestion patterns, and computer vision citizen reports to forecast flood risks, suggest safe travel corridors, and mobilize rapid municipal emergency response across Nagpur.
          </p>

          {/* Specular Interactive Hero Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <SpecularButton
              size="lg"
              radius={16}
              tint="#881337"
              tintOpacity={0.9}
              blur={12}
              textColor="#ffffff"
              lineColor="#f43f5e"
              baseColor="#4c0519"
              intensity={1.4}
              shineSize={18}
              shineFade={35}
              thickness={1.5}
              speed={0.4}
              followMouse={true}
              proximity={280}
              autoAnimate={false}
              onClick={() => router.push("/login")}
              className="shadow-glow-burgundy"
            >
              <div className="flex items-center space-x-2 font-semibold text-sm">
                <LogIn className="w-4 h-4 text-rose-300" />
                <span>Sign In to Crisis Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </SpecularButton>

            <SpecularButton
              size="lg"
              radius={16}
              tint="#1e293b"
              tintOpacity={0.8}
              blur={10}
              textColor="#f8fafc"
              lineColor="#38bdf8"
              baseColor="#334155"
              intensity={1.2}
              shineSize={16}
              shineFade={40}
              thickness={1.2}
              speed={0.35}
              followMouse={true}
              proximity={260}
              autoAnimate={false}
              onClick={() => router.push("/login")}
            >
              <div className="flex items-center space-x-2 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Role-Based Access (Citizen / Admin)</span>
              </div>
            </SpecularButton>
          </div>
        </div>

        {/* Subtle Decorative Background Graphic */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Cpu className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* React Bits ScrollExpand Component with 16:9 My Nagpur Landscape */}
      <section className="relative w-full rounded-card-lg border border-slate-700/60 shadow-2xl bg-slate-950">
        <ScrollExpand
          src="/my-nagpur.jpg"
          alt="MY NAGPUR Waterway & City Landmark"
          title="Built For Citizens of Nagpur"
          scrollHint="Scroll to Reveal Mission ↓"
          startWidth={50}
          startHeight={50}
          startRadius={24}
          endRadius={16}
          mediaZoom={1.2}
          scrollDistance={1.4}
          holdDistance={1.2}
          smoothing={0.05}
          overlayScrim={0.65}
          useWindowScroll={true}
        >
          <div className="max-w-3xl text-white space-y-5 px-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/30 border border-emerald-400/40 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-200 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>NAGDRISHTI-AI CITIZEN RESILIENCE ENGINE</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-xl text-slate-50">
              To predict real-time urban disaster and find out shortest route while waterlogging and show heatmap according to condition
            </h2>
            
            <p className="text-xs sm:text-base text-slate-200 leading-relaxed font-medium drop-shadow-md max-w-2xl mx-auto">
              Empowering every citizen, commuter, and emergency rescue officer across Nagpur with live PostGIS flood telemetry, safe route bypasses, and instant AI vision reporting.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explore Nagpur Crisis Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-slate-200 font-semibold px-5 py-3 rounded-xl text-xs transition backdrop-blur-md"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                <span>View 10-Ward Heatmap</span>
              </Link>
            </div>
          </div>
        </ScrollExpand>
      </section>

      {/* Dual Role Experience Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-7 rounded-card border border-slate-200 shadow-card-soft space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-navy-900">Citizen Experience Portal</h2>
            <p className="text-xs text-slate-500">
              For residents, commuters, and emergency volunteers navigating Nagpur during intense precipitation events.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>10-Ward Geospatial PostGIS Heatmap</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>A* Safe Route Navigation with Submerged Road Bypass</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Citizen Road Inundation Photo Reporting (AI Vision)</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link
              href="/login"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Access Citizen Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-7 rounded-card border border-slate-200 shadow-card-soft space-y-4">
          <div className="w-12 h-12 rounded-xl bg-burgundy-50 text-burgundy-900 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-navy-900">Municipal Command Hub</h2>
            <p className="text-xs text-slate-500">
              Restricted to authorized Nagpur Municipal Corporation (NMC) emergency officers and rescue squads.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-700"></span>
              <span>Ward Crisis Priority Queue (Descending Risk Score)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-700"></span>
              <span>Citizen Incident Photo Verification Grid</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-700"></span>
              <span>Twilio SMS & WhatsApp Emergency Broadcast Logs</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-700"></span>
              <span>8-Stage Cloudburst Simulation Controller</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link
              href="/login"
              className="text-xs font-bold text-burgundy-900 hover:text-burgundy-800 flex items-center space-x-1"
            >
              <span>Access Command Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Telemetry Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Nagpur Weather Radar</span>
            <CloudRain className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-navy-900">Live</span>
            <span className="text-xs font-semibold text-emerald-600">Open-Meteo Ingest Active</span>
          </div>
          <p className="text-xs text-slate-500">
            Scheduled rainfall ingestion covering 10 municipal wards in real time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Spatial Data Engine</span>
            <AlertTriangle className="w-5 h-5 text-burgundy-700" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-navy-900">PostGIS</span>
            <span className="text-xs font-semibold text-slate-600">Supabase Connected</span>
          </div>
          <p className="text-xs text-slate-500">
            Topographic elevation, drainage capacity, and boundary geometry models.
          </p>
        </div>

        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Emergency Broadcasts</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-700">Armed</span>
            <span className="text-xs font-semibold text-slate-600">Twilio SMS & WhatsApp</span>
          </div>
          <p className="text-xs text-slate-500">
            Automated alerts dispatched upon High / Severe crisis thresholds.
          </p>
        </div>
      </section>
    </div>
  );
}
