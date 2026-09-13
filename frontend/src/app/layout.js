import "./globals.css";
import { Inter } from "next/font/google";
import NavbarClient from "./NavbarClient";
import { AuthProvider } from "../context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b1329",
};

export const metadata = {
  title: "NagDrishtiAI — Nagpur Urban Crisis Management System",
  description: "Real-time flood risk forecasting, safe routing corridors, and municipal command system for Nagpur powered by NagDrishtiAI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans overflow-x-hidden">
        <AuthProvider>
          {/* Header Navigation */}
          <NavbarClient />

          {/* Main Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span>© {new Date().getFullYear()} NagDrishtiAI — Nagpur Municipal Corporation (NMC)</span>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-slate-400 text-[11px]">
                <span>PostGIS Geospatial</span>
                <span>•</span>
                <span>Open-Meteo IMD</span>
                <span>•</span>
                <span>NetworkX A*</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
