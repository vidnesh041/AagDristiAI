"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../lib/apiConfig";
import Link from "next/link";
import {
  RefreshCw,
  Info,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Car,
  Navigation,
  CheckCircle2,
  Layers,
  ArrowRight,
  Satellite,
  Map as MapIcon,
  Camera,
  Eye,
  X,
  ExternalLink,
  Sparkles,
  UploadCloud,
  Check,
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  Wind,
  Thermometer,
  Flame,
  Radio,
  Sliders,
  Compass,
  MoreVertical,
  Maximize2,
  Minimize2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Tile layer definitions with high-resolution satellite imagery + crystal clear place names & road labels
const TILE_LAYERS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    maxNativeZoom: 18,
  },
  satellite: {
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    places: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    roads: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; High-Res Satellite Imagery & Place Names',
    maxZoom: 19,
    maxNativeZoom: 17,
  },
  hybrid: {
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
    roads: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19,
    maxNativeZoom: 17,
  },
};

// 10 Nagpur Wards GeoJSON Dataset (Guarantees map renders immediately)
const NAGPUR_ZONES_DATA = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: 1,
      properties: {
        id: 1,
        name: "Dharampeth (Zone 2)",
        risk_score: 84.2,
        category: "Severe",
        is_photo_confirmed: true,
        elevation_factor: 0.88,
        drainage_capacity: 38.0,
        dispatch_status: "Dispatched",
        rainfall_mm: 58.5,
        congestion_level: 85,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.055, 21.14],
            [79.075, 21.14],
            [79.075, 21.155],
            [79.055, 21.155],
            [79.055, 21.14],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 2,
      properties: {
        id: 2,
        name: "Sitabuldi (Zone 4)",
        risk_score: 71.0,
        category: "High",
        is_photo_confirmed: false,
        elevation_factor: 0.82,
        drainage_capacity: 42.0,
        dispatch_status: "Unassigned",
        rainfall_mm: 46.0,
        congestion_level: 78,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.075, 21.14],
            [79.095, 21.14],
            [79.095, 21.152],
            [79.075, 21.152],
            [79.075, 21.14],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 3,
      properties: {
        id: 3,
        name: "Somalwada (Zone 9)",
        risk_score: 76.5,
        category: "Severe",
        is_photo_confirmed: true,
        elevation_factor: 0.75,
        drainage_capacity: 40.0,
        dispatch_status: "Dispatched",
        rainfall_mm: 52.0,
        congestion_level: 72,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.05, 21.085],
            [79.08, 21.085],
            [79.08, 21.11],
            [79.05, 21.11],
            [79.05, 21.085],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 4,
      properties: {
        id: 4,
        name: "Mahal (Zone 5)",
        risk_score: 44.0,
        category: "Medium",
        is_photo_confirmed: false,
        elevation_factor: 0.55,
        drainage_capacity: 55.0,
        dispatch_status: "Unassigned",
        rainfall_mm: 31.0,
        congestion_level: 60,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.095, 21.14],
            [79.12, 21.14],
            [79.12, 21.155],
            [79.095, 21.155],
            [79.095, 21.14],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 5,
      properties: {
        id: 5,
        name: "Gandhibagh (Zone 6)",
        risk_score: 48.2,
        category: "Medium",
        is_photo_confirmed: false,
        elevation_factor: 0.6,
        drainage_capacity: 50.0,
        dispatch_status: "Unassigned",
        rainfall_mm: 34.0,
        congestion_level: 65,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.095, 21.155],
            [79.125, 21.155],
            [79.125, 21.17],
            [79.095, 21.17],
            [79.095, 21.155],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 6,
      properties: {
        id: 6,
        name: "Dhantoli (Zone 4)",
        risk_score: 36.0,
        category: "Medium",
        is_photo_confirmed: false,
        elevation_factor: 0.7,
        drainage_capacity: 48.0,
        dispatch_status: "Resolved",
        rainfall_mm: 24.0,
        congestion_level: 45,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.07, 21.125],
            [79.095, 21.125],
            [79.095, 21.14],
            [79.07, 21.14],
            [79.07, 21.125],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 7,
      properties: {
        id: 7,
        name: "Sadar (Zone 3)",
        risk_score: 18.5,
        category: "Low",
        is_photo_confirmed: false,
        elevation_factor: 0.35,
        drainage_capacity: 75.0,
        dispatch_status: "Unassigned",
        rainfall_mm: 14.0,
        congestion_level: 35,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.07, 21.152],
            [79.095, 21.152],
            [79.095, 21.175],
            [79.07, 21.175],
            [79.07, 21.152],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 8,
      properties: {
        id: 8,
        name: "Mangalwari (Zone 10)",
        risk_score: 15.0,
        category: "Low",
        is_photo_confirmed: false,
        elevation_factor: 0.4,
        drainage_capacity: 70.0,
        dispatch_status: "Unassigned",
        rainfall_mm: 12.0,
        congestion_level: 30,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.06, 21.175],
            [79.095, 21.175],
            [79.095, 21.2],
            [79.06, 21.2],
            [79.06, 21.175],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 9,
      properties: {
        id: 9,
        name: "Hanuman Nagar (Zone 8)",
        risk_score: 22.0,
        category: "Low",
        is_photo_confirmed: false,
        elevation_factor: 0.45,
        drainage_capacity: 65.0,
        dispatch_status: "Unassigned",
        rainfall_mm: 18.0,
        congestion_level: 40,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.095, 21.11],
            [79.125, 21.11],
            [79.125, 21.135],
            [79.095, 21.135],
            [79.095, 21.11],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: 10,
      properties: {
        id: 10,
        name: "Laxmi Nagar (Zone 1)",
        risk_score: 24.5,
        category: "Low",
        is_photo_confirmed: false,
        elevation_factor: 0.5,
        drainage_capacity: 60.0,
        dispatch_status: "Resolved",
        rainfall_mm: 20.0,
        congestion_level: 42,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.045, 21.115],
            [79.07, 21.115],
            [79.07, 21.14],
            [79.045, 21.14],
            [79.045, 21.115],
          ],
        ],
      },
    },
  ],
};

export default function MapClient() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const weatherRadarLayerRef = useRef(null);
  const photoMarkersLayerRef = useRef(null);
  const baseLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const reportsMarkersLayerRef = useRef(null);
  const constructionMarkersLayerRef = useRef(null);

  const [geoData, setGeoData] = useState(NAGPUR_ZONES_DATA);
  const [reportsList, setReportsList] = useState([]);
  const [constructionList, setConstructionList] = useState([]);
  const [showCitizenReports, setShowCitizenReports] = useState(true);
  const [showConstructionZones, setShowConstructionZones] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWard, setSelectedWard] = useState(NAGPUR_ZONES_DATA.features[0].properties);
  const [mapLayer, setMapLayer] = useState("street"); // 'street' | 'satellite' | 'hybrid'
  const [backendConnected, setBackendConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [refreshToast, setRefreshToast] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Real-time Live Weather Detection State (Open-Meteo & IMD Doppler)
  const [weatherData, setWeatherData] = useState({
    temperature: 24.8,
    feels_like: 28.6,
    humidity: 91,
    precipitation_mm: 0.0,
    rain_mm: 0.0,
    weather_code: 3,
    weather_description: "Overcast",
    cloud_cover_percent: 100,
    wind_speed_kmh: 12.6,
    wind_direction_deg: 261,
    is_day: false,
    timestamp: new Date().toLocaleTimeString(),
    source: "Open-Meteo IMD Live Feed",
  });
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Layer Visibility & Side Controls Toggles
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(true);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showWeatherRadar, setShowWeatherRadar] = useState(true);
  const [showPrecipitationIsohyet, setShowPrecipitationIsohyet] = useState(true);
  const [showPhotoHotspots, setShowPhotoHotspots] = useState(true);
  const [showDopplerPulse, setShowDopplerPulse] = useState(true);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);

  // Three-dot Menu & Full Screen States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [menuTab, setMenuTab] = useState("all"); // 'all' | 'weather' | 'layers'

  const toggleFullScreen = () => {
    const nextState = !isFullScreen;
    setIsFullScreen(nextState);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
  };

  // Fetch real-time live meteorological telemetry from backend / Open-Meteo
  const fetchLiveWeather = async () => {
    setWeatherLoading(true);
    try {
      let res = await fetch(`${API_BASE_URL}/api/zones/weather/live/`);

      if (res && res.ok) {
        const data = await res.json();
        setWeatherData({
          temperature: data.temperature,
          feels_like: data.feels_like,
          humidity: data.humidity,
          precipitation_mm: data.precipitation_mm,
          rain_mm: data.rain_mm,
          weather_code: data.weather_code,
          weather_description: data.weather_description,
          cloud_cover_percent: data.cloud_cover_percent,
          wind_speed_kmh: data.wind_speed_kmh,
          wind_direction_deg: data.wind_direction_deg,
          is_day: data.is_day,
          timestamp: new Date().toLocaleTimeString(),
          source: data.source || "Open-Meteo Live Feed",
        });
      } else {
        // Direct Open-Meteo API fallback
        const omRes = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=Asia%2FKolkata"
        );
        if (omRes.ok) {
          const omData = await omRes.json();
          const cur = omData.current || {};
          setWeatherData({
            temperature: cur.temperature_2m || 25.0,
            feels_like: cur.apparent_temperature || 28.0,
            humidity: cur.relative_humidity_2m || 85,
            precipitation_mm: cur.precipitation || 0.0,
            rain_mm: cur.rain || 0.0,
            weather_code: cur.weather_code || 3,
            weather_description: cur.weather_code >= 50 ? "Monsoon Rain Detected" : "Overcast Clouds",
            cloud_cover_percent: cur.cloud_cover || 90,
            wind_speed_kmh: cur.wind_speed_10m || 12.0,
            wind_direction_deg: cur.wind_direction_10m || 240,
            is_day: true,
            timestamp: new Date().toLocaleTimeString(),
            source: "Open-Meteo Global Feed",
          });
        }
      }
    } catch (err) {
      console.warn("Weather sync notice", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch latest risk data from backend, with optional live sensor refresh
  const fetchZoneData = async (isManualRefresh = false) => {
    setLoading(true);
    const endpoint = isManualRefresh
      ? `${API_BASE_URL}/api/zones/risk/?refresh=true`
      : `${API_BASE_URL}/api/zones/risk/`;

    try {
      let res = await fetch(endpoint);

      if (res && res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          setGeoData(data);
          setBackendConnected(true);
          const timeStr = new Date().toLocaleTimeString();
          setLastSyncTime(timeStr);

          // If selected ward is in data, update it
          const updated = data.features.find((f) => f.properties.id === selectedWard?.id);
          if (updated) {
            setSelectedWard(updated.properties);
          } else {
            setSelectedWard(data.features[0].properties);
          }

          if (isManualRefresh) {
            setRefreshToast({
              type: "success",
              message: `Telemetry live-refreshed from sensors at ${timeStr}. Risk scores recalculated!`,
            });
            setTimeout(() => setRefreshToast(null), 4000);
          }
        }
      } else {
        throw new Error("Backend response not ok");
      }

      // Fetch citizen hazard reports for map overlay
      try {
        const repRes = await fetch(`${API_BASE_URL}/api/reports/`);
        if (repRes.ok) {
          const reps = await repRes.json();
          setReportsList(Array.isArray(reps) ? reps : reps.results || []);
        }
      } catch (repErr) {
        console.warn("Reports fetch notice", repErr);
      }

      // Fetch active construction zones for map overlay
      try {
        const czRes = await fetch(`${API_BASE_URL}/api/construction/?active=true`);
        if (czRes.ok) {
          const czData = await czRes.json();
          setConstructionList(Array.isArray(czData) ? czData : czData.results || []);
        }
      } catch (czErr) {
        console.warn("Construction zones fetch notice", czErr);
      }
    } catch (err) {
      console.warn("Backend /api/zones/risk/ unreachable, generating client simulated telemetry", err);
      setBackendConnected(false);

      if (isManualRefresh) {
        // Generate realistic simulated client telemetry when backend is offline
        const timeStr = new Date().toLocaleTimeString();
        setGeoData((prev) => {
          const updatedFeatures = prev.features.map((f) => {
            const rainDelta = (Math.random() * 8 - 3);
            const newRain = Math.max(5, Math.min(95, parseFloat((f.properties.rainfall_mm + rainDelta).toFixed(1))));
            const trafficDelta = Math.floor(Math.random() * 11 - 5);
            const newTraffic = Math.max(10, Math.min(98, f.properties.congestion_level + trafficDelta));

            // Multi-factor formula
            const rainScore = Math.min(100, (newRain / 80.0) * 100.0);
            const drainageDeficit = Math.max(0, 100 - f.properties.drainage_capacity);
            const elevationScore = f.properties.elevation_factor * 100.0;
            const rawScore = 0.35 * rainScore + 0.25 * drainageDeficit + 0.15 * elevationScore + 0.15 * 30 + 0.10 * 30;
            const finalScore = parseFloat(Math.max(5, Math.min(98, rawScore)).toFixed(1));

            let cat = "Low";
            if (finalScore > 75) cat = "Severe";
            else if (finalScore > 50) cat = "High";
            else if (finalScore > 25) cat = "Medium";

            return {
              ...f,
              properties: {
                ...f.properties,
                rainfall_mm: newRain,
                congestion_level: newTraffic,
                risk_score: finalScore,
                category: cat,
              },
            };
          });

          const currentSelected = updatedFeatures.find((f) => f.properties.id === selectedWard?.id);
          if (currentSelected) {
            setSelectedWard(currentSelected.properties);
          }

          return {
            ...prev,
            features: updatedFeatures,
          };
        });

        setLastSyncTime(timeStr);
        setRefreshToast({
          type: "simulated",
          message: `Telemetry refreshed with real-time sensor simulation at ${timeStr}`,
        });
        setTimeout(() => setRefreshToast(null), 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch telemetry & live weather data immediately on page load
  useEffect(() => {
    fetchZoneData(false);
    fetchLiveWeather();
    // Periodic auto-refresh every 30s
    const timer = setInterval(() => {
      fetchZoneData(false);
      fetchLiveWeather();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Leaflet Map once on client mount
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [21.1458, 79.0882],
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      // Add Zoom Controls (+ / -) cleanly to the Top-Right of the map
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add default street tile
      const baseTile = L.tileLayer(TILE_LAYERS.street.url, {
        attribution: TILE_LAYERS.street.attribution,
        maxZoom: TILE_LAYERS.street.maxZoom,
        maxNativeZoom: TILE_LAYERS.street.maxNativeZoom,
      });
      baseTile.addTo(map);
      baseLayerRef.current = baseTile;

      // Custom Marker for NMC Central Command
      const nagpurIcon = L.icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([21.1458, 79.0882], { icon: nagpurIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <strong style="font-size: 13px; color: #0F172A; display: block; margin-bottom: 2px;">
            Nagpur Municipal Corporation (NMC)
          </strong>
          <span style="font-size: 11px; color: #64748B;">Central Disaster Command Headquarters</span>
          <div style="margin-top: 6px; font-size: 11px; color: #059669; font-weight: 600;">
            ✓ Real-time Monitoring & Weather Radar Active
          </div>
        </div>
      `);

      renderGeoJsonLayer(L, map, geoData, selectedCategory, showRiskHeatmap);
      renderWeatherAndRadarOverlays(L, map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch map tile layer when mapLayer state changes
  useEffect(() => {
    if (typeof window === "undefined" || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((module) => {
      const L = module.default;

      // Remove current base layer and optional labels
      if (baseLayerRef.current) {
        map.removeLayer(baseLayerRef.current);
        baseLayerRef.current = null;
      }
      if (labelsLayerRef.current) {
        map.removeLayer(labelsLayerRef.current);
        labelsLayerRef.current = null;
      }

      if (mapLayer === "street") {
        const t = L.tileLayer(TILE_LAYERS.street.url, {
          attribution: TILE_LAYERS.street.attribution,
          maxZoom: TILE_LAYERS.street.maxZoom,
          maxNativeZoom: TILE_LAYERS.street.maxNativeZoom,
        });
        t.addTo(map);
        baseLayerRef.current = t;
      } else if (mapLayer === "satellite") {
        const base = L.tileLayer(TILE_LAYERS.satellite.base, {
          attribution: TILE_LAYERS.satellite.attribution,
          maxZoom: TILE_LAYERS.satellite.maxZoom,
          maxNativeZoom: TILE_LAYERS.satellite.maxNativeZoom,
        });
        base.addTo(map);
        baseLayerRef.current = base;

        // Always load high-contrast Place & Locality Names on top of satellite imagery
        const places = L.tileLayer(TILE_LAYERS.satellite.places, {
          maxZoom: TILE_LAYERS.satellite.maxZoom,
          maxNativeZoom: TILE_LAYERS.satellite.maxNativeZoom,
          zIndex: 400,
        });
        places.addTo(map);
        labelsLayerRef.current = places;
      } else if (mapLayer === "hybrid") {
        const base = L.tileLayer(TILE_LAYERS.hybrid.base, {
          attribution: TILE_LAYERS.hybrid.attribution,
          maxZoom: TILE_LAYERS.hybrid.base.maxZoom,
          maxNativeZoom: TILE_LAYERS.hybrid.base.maxNativeZoom,
        });
        base.addTo(map);
        baseLayerRef.current = base;

        // Always load Carto Voyager Street & Locality labels on top
        const labels = L.tileLayer(TILE_LAYERS.hybrid.labels, {
          maxZoom: TILE_LAYERS.hybrid.maxZoom,
          maxNativeZoom: TILE_LAYERS.hybrid.maxNativeZoom,
          zIndex: 400,
        });
        labels.addTo(map);
        labelsLayerRef.current = labels;
      }

      // Re-add layers on top of new tiles
      if (geojsonLayerRef.current) {
        geojsonLayerRef.current.bringToFront();
      }
    });
  }, [mapLayer]);

  // Update GeoJSON Layer when data, category, heatmap or traffic toggle changes
  useEffect(() => {
    if (typeof window === "undefined" || !mapInstanceRef.current) return;

    import("leaflet").then((module) => {
      const L = module.default;
      renderGeoJsonLayer(L, mapInstanceRef.current, geoData, selectedCategory, showRiskHeatmap, showTrafficLayer);
    });
  }, [geoData, selectedCategory, showRiskHeatmap, showTrafficLayer]);

  // Update Weather and Photo Overlays when toggles or weather data change
  useEffect(() => {
    if (typeof window === "undefined" || !mapInstanceRef.current) return;

    import("leaflet").then((module) => {
      const L = module.default;
      renderWeatherAndRadarOverlays(L, mapInstanceRef.current);
    });
  }, [showWeatherRadar, showPrecipitationIsohyet, showPhotoHotspots, weatherData, geoData]);

  // Update Construction Zones Layer when list or toggle changes
  useEffect(() => {
    if (typeof window === "undefined" || !mapInstanceRef.current) return;

    import("leaflet").then((module) => {
      const L = module.default;
      renderConstructionLayer(L, mapInstanceRef.current, constructionList, showConstructionZones);
    });
  }, [constructionList, showConstructionZones]);

  // Render Active Construction Zones & Roadwork Projects Overlay
  const renderConstructionLayer = (L, map, list, isVisible) => {
    if (constructionMarkersLayerRef.current) {
      map.removeLayer(constructionMarkersLayerRef.current);
      constructionMarkersLayerRef.current = null;
    }

    if (!isVisible || !list || list.length === 0) return;

    const czGroup = L.layerGroup();

    list.forEach((cz) => {
      const lat = cz.latitude || 21.1458;
      const lon = cz.longitude || 79.0882;
      const isTomTom = cz.source === "tomtom_incidents_api";

      const markerHtml = `
        <div style="
          background: #ea580c;
          color: #ffffff;
          font-size: 14px;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(234, 88, 12, 0.45);
          cursor: pointer;
        ">
          🚧
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-construction-marker",
        html: markerHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const m = L.marker([lat, lon], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 230px; padding: 4px;">
          <div style="font-size: 13px; font-weight: 800; color: #7c2d12; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            <span>🚧</span>
            <span>${cz.name}</span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 800; background: ${isTomTom ? "#e0f2fe" : "#ffedd5"}; color: ${isTomTom ? "#0369a1" : "#9a3412"}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${isTomTom ? "#7dd3fc" : "#fdba74"};">
              Source: ${isTomTom ? "TomTom Incidents API" : "NMC Public Works"}
            </span>
            <span style="font-size: 9px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px;">
              +${cz.delay_mins}m Delay
            </span>
          </div>
          <p style="font-size: 11px; color: #475569; margin: 0; line-height: 1.35;">
            ${cz.description || "Active municipal roadwork & lane restriction in progress."}
          </p>
        </div>
      `;

      m.bindPopup(popupHtml);
      czGroup.addLayer(m);
    });

    czGroup.addTo(map);
    constructionMarkersLayerRef.current = czGroup;
  };

  // Update Citizen Reports Layer when reports or toggle changes (filters out / greys out Resolved reports)
  useEffect(() => {
    if (typeof window === "undefined" || !mapInstanceRef.current) return;

    import("leaflet").then((module) => {
      const L = module.default;
      renderReportsLayer(L, mapInstanceRef.current, reportsList, showCitizenReports);
    });
  }, [reportsList, showCitizenReports]);

  // Render Citizen Hazard Reports (Potholes / Waterlogging) with Resolved filter
  const renderReportsLayer = (L, map, reports, isVisible) => {
    if (reportsMarkersLayerRef.current) {
      map.removeLayer(reportsMarkersLayerRef.current);
      reportsMarkersLayerRef.current = null;
    }

    if (!isVisible || !reports || reports.length === 0) return;

    const repGroup = L.layerGroup();

    reports.forEach((rep) => {
      // Reject reports are discarded
      if (rep.verification_status === "Rejected") return;

      const isResolved = rep.verification_status === "Resolved";
      const isVerified = rep.verification_status === "Verified";
      const isWater = rep.waterlogging_detected;
      const hazardEmoji = isWater ? "🌊" : "🕳️";
      const hazardTitle = isWater ? "Waterlogging" : "Pothole";

      const lat = rep.latitude || 21.1458;
      const lon = rep.longitude || 79.0882;

      // Resolved reports are rendered greyed-out with lower opacity and muted styling
      const markerHtml = isResolved
        ? `
          <div style="
            background: #64748b;
            color: #ffffff;
            opacity: 0.45;
            font-size: 13px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #cbd5e1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            filter: grayscale(100%);
          ">
            ✓
          </div>
        `
        : `
          <div style="
            background: ${isVerified ? "#e11d48" : "#f59e0b"};
            color: #ffffff;
            font-size: 13px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          ">
            ${hazardEmoji}
          </div>
        `;

      const customIcon = L.divIcon({
        className: "custom-report-hazard-marker",
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const m = L.marker([lat, lon], { icon: customIcon });

      const popupHtml = isResolved
        ? `
          <div style="font-family: Inter, sans-serif; padding: 2px;">
            <div style="color: #64748b; font-size: 11px; font-weight: bold; text-decoration: line-through;">
              ${hazardEmoji} ${hazardTitle} (Report #${rep.id})
            </div>
            <div style="margin-top: 4px; display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
              ✓ Resolved & Cleared by NMC
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              Ward: ${rep.zone_name || "Nagpur"} &bull; Hazard is fixed and no longer active.
            </div>
          </div>
        `
        : `
          <div style="font-family: Inter, sans-serif; padding: 2px;">
            <div style="color: ${isVerified ? "#be123c" : "#b45309"}; font-size: 12px; font-weight: bold;">
              ${hazardEmoji} Active ${hazardTitle} (Report #${rep.id})
            </div>
            <div style="margin-top: 4px; display: inline-block; background: ${isVerified ? "#fef2f2" : "#fffbeb"}; color: ${isVerified ? "#991b1b" : "#92400e"}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
              ${isVerified ? "🚨 AI Verified Hazard" : "⏳ Pending Inspection"}
            </div>
            <p style="font-size: 11px; color: #334155; margin-top: 4px;">
              ${rep.description || "Reported hazard on corridor."}
            </p>
          </div>
        `;

      m.bindPopup(popupHtml);
      repGroup.addLayer(m);
    });

    repGroup.addTo(map);
    reportsMarkersLayerRef.current = repGroup;
  };

  // Render Risk Heatmap / Traffic Layer GeoJSON
  const renderGeoJsonLayer = (L, map, data, filterCat, isHeatmapVisible, isTrafficVisible) => {
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const layer = L.geoJSON(data, {
      style: (feature) => {
        const p = feature?.properties || {};
        const category = p.category || "Low";
        const congestion = p.congestion_level || 0;

        let fillColor = "#10B981"; // Low Risk (Green)
        let color = "#047857";
        let fillOpacity = isHeatmapVisible ? 0.50 : 0.05;

        // If Traffic Layer is active, use distinct traffic color scale
        if (isTrafficVisible) {
          if (congestion < 35) {
            fillColor = "#22c55e"; // Smooth (Emerald)
            color = "#15803d";
          } else if (congestion < 60) {
            fillColor = "#eab308"; // Moderate (Yellow)
            color = "#a16207";
          } else if (congestion < 80) {
            fillColor = "#f97316"; // Heavy (Orange)
            color = "#c2410c";
          } else {
            fillColor = "#dc2626"; // Gridlock (Red)
            color = "#991b1b";
          }
          fillOpacity = 0.65;
        } else {
          // Standard Disaster Risk color scale
          if (category === "Medium") {
            fillColor = "#F59E0B"; // Amber
            color = "#B45309";
            fillOpacity = isHeatmapVisible ? 0.55 : 0.05;
          } else if (category === "High") {
            fillColor = "#F43F5E"; // Rose
            color = "#BE123C";
            fillOpacity = isHeatmapVisible ? 0.65 : 0.05;
          } else if (category === "Severe") {
            fillColor = "#881337"; // Deep Burgundy
            color = "#4C0519";
            fillOpacity = isHeatmapVisible ? 0.75 : 0.05;
          }
        }

        if (filterCat !== "All" && category !== filterCat) {
          fillOpacity = 0.04;
          color = "#CBD5E1";
        }

        return {
          fillColor,
          weight: (isHeatmapVisible || isTrafficVisible) ? 2 : 1.5,
          opacity: (isHeatmapVisible || isTrafficVisible) ? 1 : 0.4,
          color,
          dashArray: p.is_photo_confirmed ? "" : "3",
          fillOpacity,
        };
      },
      onEachFeature: (feature, l) => {
        const p = feature.properties;
        // Bind permanent, crystal-clear ward name badge
        l.bindTooltip(
          `<div style="font-weight: 800; font-size: 11px; color: #0F172A; text-shadow: 0 1px 3px rgba(255,255,255,0.95); background: rgba(255,255,255,0.85); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1);">${p.name}</div>`,
          { permanent: true, direction: "center", className: "ward-label-pill" }
        );

        const riskCat = p.category || "Low";
        const riskColor = riskCat === "Severe" ? "#881337" : riskCat === "High" ? "#e11d48" : riskCat === "Medium" ? "#d97706" : "#059669";
        const cong = p.congestion_level || 0;
        const trafficColor = cong >= 75 ? "#dc2626" : cong >= 50 ? "#ea580c" : cong >= 30 ? "#d97706" : "#16a34a";
        const trafficLabel = cong >= 75 ? "Severe Gridlock" : cong >= 50 ? "Heavy Delay" : cong >= 30 ? "Moderate Flow" : "Smooth Flow";

        // Dual-Metric Popup: Shows BOTH Risk Score AND Current Traffic Congestion
        l.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 230px; padding: 3px;">
            <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              📍 ${p.name}
            </div>

            <!-- Risk Score Metric -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 5px 8px; border-radius: 6px; margin-bottom: 5px; border: 1px solid #e2e8f0;">
              <span style="font-size: 11px; color: #475569; font-weight: 600;">🛡️ Disaster Risk:</span>
              <span style="font-size: 12px; font-weight: 800; color: ${riskColor};">${p.risk_score || 0}/100 (${riskCat})</span>
            </div>

            <!-- Traffic Congestion Metric -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 5px 8px; border-radius: 6px; margin-bottom: 5px; border: 1px solid #e2e8f0;">
              <span style="font-size: 11px; color: #475569; font-weight: 600;">🚗 Traffic Flow:</span>
              <span style="font-size: 12px; font-weight: 800; color: ${trafficColor};">${cong}% (${trafficLabel})</span>
            </div>

            <div style="font-size: 10px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between; margin-top: 4px;">
              <span>🌧️ Rain: ${p.rainfall_mm || 0}mm</span>
              <span>🚰 Drainage: ${p.drainage_capacity || 50}%</span>
            </div>
          </div>
        `);

        l.on({
          click: () => {
            setSelectedWard(p);
          },
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = layer;
  };

  // Render Real-time Weather Radar & Photo Hotspot Overlays
  const renderWeatherAndRadarOverlays = (L, map) => {
    // 1. Clean up existing radar layer
    if (weatherRadarLayerRef.current) {
      map.removeLayer(weatherRadarLayerRef.current);
      weatherRadarLayerRef.current = null;
    }

    // 2. Clean up existing photo layer
    if (photoMarkersLayerRef.current) {
      map.removeLayer(photoMarkersLayerRef.current);
      photoMarkersLayerRef.current = null;
    }

    // Build Weather Radar & Precipitation Rings
    if (showWeatherRadar || showPrecipitationIsohyet) {
      const radarGroup = L.layerGroup();

      // Central Nagpur Doppler Pulse Radar Circle
      if (showWeatherRadar) {
        const centralRadar = L.circle([21.1458, 79.0882], {
          radius: 6500,
          color: "#0284c7",
          weight: 1.5,
          opacity: 0.7,
          fillColor: "#38bdf8",
          fillOpacity: 0.12,
          dashArray: "4, 6",
        });
        centralRadar.bindTooltip(
          `<div><strong>IMD Nagpur Doppler Radar</strong><br/>Cloud Cover: ${weatherData.cloud_cover_percent}%<br/>Precipitation: ${weatherData.precipitation_mm} mm/h</div>`,
          { sticky: true }
        );
        radarGroup.addLayer(centralRadar);

        const outerRadar = L.circle([21.1458, 79.0882], {
          radius: 9500,
          color: "#0369a1",
          weight: 1,
          opacity: 0.4,
          fillColor: "#0284c7",
          fillOpacity: 0.05,
        });
        radarGroup.addLayer(outerRadar);
      }

      // Per-ward precipitation isohyet rings
      if (showPrecipitationIsohyet && geoData.features) {
        geoData.features.forEach((f) => {
          const coords = f.geometry.coordinates[0];
          // Approximate center
          const avgLng = (coords[0][0] + coords[2][0]) / 2;
          const avgLat = (coords[0][1] + coords[2][1]) / 2;
          const rain = f.properties.rainfall_mm || 20;

          const rainCircle = L.circle([avgLat, avgLng], {
            radius: Math.max(800, rain * 25),
            color: rain > 50 ? "#9333ea" : rain > 35 ? "#2563eb" : "#06b6d4",
            weight: 1,
            opacity: 0.8,
            fillColor: rain > 50 ? "#a855f7" : rain > 35 ? "#3b82f6" : "#22d3ee",
            fillOpacity: Math.min(0.35, rain / 180),
          });
          rainCircle.bindTooltip(
            `<div><strong>${f.properties.name}</strong><br/>Live Rain: <strong>${rain} mm</strong></div>`,
            { sticky: true }
          );
          radarGroup.addLayer(rainCircle);
        });
      }

      radarGroup.addTo(map);
      weatherRadarLayerRef.current = radarGroup;
    }

    // (Photo hotspots removed per minimal clean display configuration)
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-card border border-slate-200 shadow-card-soft">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-burgundy-700 animate-pulse"></span>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">Nagpur Ward Risk Heatmap</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time geospatial hazard classification across 10 municipal wards with PostGIS polygons.
          </p>
        </div>

        {/* Action Controls & Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => fetchZoneData(true)}
            disabled={loading}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
              loading
                ? "bg-navy-800 text-sky-200 cursor-wait ring-2 ring-sky-400"
                : "bg-navy-900 text-white hover:bg-navy-800 active:scale-95"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
            <span>{loading ? "Syncing Telemetry..." : "Refresh Telemetry"}</span>
          </button>

          {/* Legend Filters */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold">
            <button
              onClick={() => setSelectedCategory(selectedCategory === "Low" ? "All" : "Low")}
              className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full border transition ${
                selectedCategory === "Low" ? "ring-2 ring-emerald-500" : ""
              } bg-emerald-50 text-emerald-800 border-emerald-200`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Low (0-25)</span>
            </button>

            <button
              onClick={() => setSelectedCategory(selectedCategory === "Medium" ? "All" : "Medium")}
              className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full border transition ${
                selectedCategory === "Medium" ? "ring-2 ring-amber-500" : ""
              } bg-amber-50 text-amber-800 border-amber-200`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Medium (26-50)</span>
            </button>

            <button
              onClick={() => setSelectedCategory(selectedCategory === "High" ? "All" : "High")}
              className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full border transition ${
                selectedCategory === "High" ? "ring-2 ring-rose-500" : ""
              } bg-rose-50 text-rose-800 border-rose-200`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>High (51-75)</span>
            </button>

            <button
              onClick={() => setSelectedCategory(selectedCategory === "Severe" ? "All" : "Severe")}
              className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full border transition ${
                selectedCategory === "Severe" ? "ring-2 ring-burgundy-900" : ""
              } bg-burgundy-50 text-burgundy-900 border-burgundy-300`}
            >
              <span className="w-2 h-2 rounded-full bg-burgundy-900"></span>
              <span>Severe (76-100)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Refresh Toast Notification */}
      {refreshToast && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
            refreshToast.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-sky-50 border-sky-300 text-sky-900"
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{refreshToast.message}</span>
          </div>
          <button
            onClick={() => setRefreshToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Map + Selected Ward Inspector Layout */}
      <div className={`grid grid-cols-1 ${isFullScreen ? "" : "lg:grid-cols-3"} gap-6`}>
        {/* Left Column: Interactive Leaflet Map */}
        <div
          className={`${
            isFullScreen
              ? "fixed inset-0 z-[10000] w-screen h-screen bg-slate-950 p-3"
              : "lg:col-span-2 relative z-10"
          }`}
        >
          {/* Map tile container — overflow-hidden here so rounded corners clip the tiles */}
          <div
            className={`rounded-card overflow-hidden border border-slate-200 shadow-card-soft bg-slate-100 relative ${
              isFullScreen ? "h-full w-full" : ""
            }`}
          >
            <div
              ref={mapContainerRef}
              className={`w-full ${isFullScreen ? "h-full" : "h-[420px] sm:h-[520px] lg:h-[620px]"}`}
            />
          </div>

          {/* ========================================================================= */}
          {/* 1. TOP-LEFT CONTROLS BAR: THREE-DOT MENU (⋮) & FULLSCREEN TOGGLE (⛶)      */}
          {/* ========================================================================= */}
          <div
            style={{ zIndex: 9999, pointerEvents: "auto" }}
            className="absolute top-3 left-3 sm:top-6 sm:left-6 flex items-center space-x-2 font-mono"
          >
            {/* Three-Dot Menu Toggle Button (Minimal Monochrome Black & White) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl shadow-2xl border text-xs font-bold transition cursor-pointer backdrop-blur-md ${
                isMenuOpen
                  ? "bg-white text-black border-white ring-2 ring-zinc-400"
                  : "bg-black/90 hover:bg-black text-white border-zinc-700 hover:border-zinc-500"
              }`}
              title="Open Weather Radar & Map Layers Menu"
            >
              <MoreVertical className={`w-3.5 h-3.5 ${isMenuOpen ? "text-black" : "text-white"}`} />
              <span>Weather & Map Radar</span>
              <span className={`w-2 h-2 rounded-full ${isMenuOpen ? "bg-black" : "bg-white"} animate-pulse`}></span>
            </button>

            {/* Fullscreen Toggle Button (Minimal Monochrome) */}
            <button
              type="button"
              onClick={toggleFullScreen}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-black/90 hover:bg-black text-white shadow-2xl border border-zinc-700 hover:border-zinc-500 text-xs font-bold transition cursor-pointer backdrop-blur-md"
              title={isFullScreen ? "Exit Fullscreen" : "View Map in Full Screen"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. THREE-DOT DROPDOWN DRAWER (Minimal Black & White Theme)                 */}
          {/* ========================================================================= */}
          {isMenuOpen && (
            <div
              style={{ zIndex: 9999, pointerEvents: "auto" }}
              className="absolute top-16 left-6 w-[340px] max-w-[90vw] max-h-[80vh] overflow-y-auto bg-black/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-zinc-800 p-4 text-white space-y-3.5 animate-in zoom-in-95 font-sans"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-white" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-300">
                    RADAR & OVERLAYS HUB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Minimal Monochrome Sub-Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMenuTab("weather")}
                  className={`py-1.5 px-2 rounded-lg text-center transition flex items-center justify-center space-x-1.5 ${
                    menuTab === "weather" || menuTab === "all"
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Weather Radar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuTab("layers")}
                  className={`py-1.5 px-2 rounded-lg text-center transition flex items-center justify-center space-x-1.5 ${
                    menuTab === "layers"
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Map Overlays</span>
                </button>
              </div>

              {/* TAB 1: Real-Time Weather Radar Details (Monochrome Minimal) */}
              {(menuTab === "weather" || menuTab === "all") && (
                <div className="space-y-2.5 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl font-black font-mono text-white tracking-tight">
                        {weatherData.temperature}°
                      </span>
                      <span className="text-xs text-zinc-400">C</span>
                      <span className="text-xs text-zinc-300 font-semibold ml-2">
                        {weatherData.weather_description}
                      </span>
                    </div>

                    <button
                      onClick={fetchLiveWeather}
                      disabled={weatherLoading}
                      title="Sync Live Weather Telemetry"
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? "animate-spin text-white" : ""}`} />
                    </button>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-300 flex justify-between border-t border-zinc-800/80 pt-1.5">
                    <span>Feels like: <strong className="text-white">{weatherData.feels_like}°C</strong></span>
                    <span>Rain Rate: <strong className="text-white">{weatherData.precipitation_mm} mm/h</strong></span>
                  </div>

                  {/* Minimal Micro-Metrics */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1 text-center">
                    <div className="bg-black p-1.5 rounded-lg border border-zinc-800">
                      <div className="text-zinc-400 text-[9px]">Humidity</div>
                      <div className="text-white font-bold">{weatherData.humidity}%</div>
                    </div>
                    <div className="bg-black p-1.5 rounded-lg border border-zinc-800">
                      <div className="text-zinc-400 text-[9px]">Wind</div>
                      <div className="text-white font-bold">{weatherData.wind_speed_kmh} k/h</div>
                    </div>
                    <div className="bg-black p-1.5 rounded-lg border border-zinc-800">
                      <div className="text-zinc-400 text-[9px]">Clouds</div>
                      <div className="text-white font-bold">{weatherData.cloud_cover_percent}%</div>
                    </div>
                  </div>

                  <div className="text-[9px] text-zinc-400 flex items-center justify-between pt-1 font-mono">
                    <span>{weatherData.source}</span>
                    <span className="text-white font-bold">● Live IMD Feed</span>
                  </div>
                </div>
              )}

              {/* TAB 2: Map Base Layers & Radar Overlays (Minimal B&W) */}
              {(menuTab === "layers" || menuTab === "all") && (
                <div className="space-y-3 pt-1">
                  {/* Base Layer Switcher */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      BASE MAP VIEW
                    </p>
                    <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setMapLayer("street")}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold text-center transition ${
                          mapLayer === "street"
                            ? "bg-white text-black shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Street
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapLayer("satellite")}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold text-center transition ${
                          mapLayer === "satellite"
                            ? "bg-white text-black shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Satellite
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapLayer("hybrid")}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold text-center transition ${
                          mapLayer === "hybrid"
                            ? "bg-white text-black shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Hybrid
                      </button>
                    </div>
                  </div>

                  {/* Active Radar & Geospatial Overlays */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      OVERLAY TOGGLES
                    </p>

                    {/* 1. Risk Heatmap Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowRiskHeatmap(!showRiskHeatmap)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition border ${
                        showRiskHeatmap
                          ? "bg-zinc-900 border-zinc-700 text-white"
                          : "bg-black/40 border-zinc-900 text-zinc-600 line-through"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Flame className={`w-4 h-4 ${showRiskHeatmap ? "text-white" : "text-zinc-600"}`} />
                        <span>Risk Heatmap</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${showRiskHeatmap ? "bg-white text-black" : "bg-zinc-800 text-zinc-500"}`}>
                        {showRiskHeatmap ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* 2. Live Traffic Congestion Layer Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition border ${
                        showTrafficLayer
                          ? "bg-zinc-900 border-zinc-700 text-white"
                          : "bg-black/40 border-zinc-900 text-zinc-600"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Navigation className={`w-4 h-4 ${showTrafficLayer ? "text-amber-400" : "text-zinc-600"}`} />
                        <span>Live Traffic Congestion</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${showTrafficLayer ? "bg-amber-400 text-black font-bold" : "bg-zinc-800 text-zinc-500"}`}>
                        {showTrafficLayer ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* 3. Active Roadwork / Construction Zones Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowConstructionZones(!showConstructionZones)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition border ${
                        showConstructionZones
                          ? "bg-zinc-900 border-zinc-700 text-white"
                          : "bg-black/40 border-zinc-900 text-zinc-600"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🚧</span>
                        <span>Roadwork / Construction ({constructionList.length})</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${showConstructionZones ? "bg-orange-500 text-white font-bold" : "bg-zinc-800 text-zinc-500"}`}>
                        {showConstructionZones ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* 2. Real-Time Weather Radar Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowWeatherRadar(!showWeatherRadar)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition border ${
                        showWeatherRadar
                          ? "bg-zinc-900 border-zinc-700 text-white"
                          : "bg-black/40 border-zinc-900 text-zinc-600 line-through"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Radio className={`w-4 h-4 ${showWeatherRadar ? "text-white animate-pulse" : "text-zinc-600"}`} />
                        <span>Weather Radar & Clouds</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${showWeatherRadar ? "bg-white text-black" : "bg-zinc-800 text-zinc-500"}`}>
                        {showWeatherRadar ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* 3. Rain Isohyet Intensity Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPrecipitationIsohyet(!showPrecipitationIsohyet)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition border ${
                        showPrecipitationIsohyet
                          ? "bg-zinc-900 border-zinc-700 text-white"
                          : "bg-black/40 border-zinc-900 text-zinc-600 line-through"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Droplets className={`w-4 h-4 ${showPrecipitationIsohyet ? "text-white" : "text-zinc-600"}`} />
                        <span>Rain Isohyet Rings</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${showPrecipitationIsohyet ? "bg-white text-black" : "bg-zinc-800 text-zinc-500"}`}>
                        {showPrecipitationIsohyet ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Ward Detail & Telemetry Card */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Ward Telemetry Inspector
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                selectedWard?.category === "Severe"
                  ? "bg-burgundy-100 text-burgundy-900"
                  : selectedWard?.category === "High"
                  ? "bg-rose-100 text-rose-800"
                  : selectedWard?.category === "Medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {selectedWard?.category || "Low"} Risk
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy-900">{selectedWard?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any polygon on the map to switch wards</p>
          </div>

          {/* Risk Score Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Calculated Risk Index:</span>
              <span className="text-navy-900 font-mono text-sm">{selectedWard?.risk_score} / 100</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedWard?.risk_score >= 75
                    ? "bg-burgundy-900"
                    : selectedWard?.risk_score >= 50
                    ? "bg-rose-500"
                    : selectedWard?.risk_score >= 25
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, selectedWard?.risk_score || 0)}%` }}
              ></div>
            </div>
          </div>

          {/* Photo Verification Interactive Banner */}
          {selectedWard?.is_photo_confirmed ? (
            <div
              onClick={() => setShowPhotoModal(true)}
              className="p-3.5 rounded-xl bg-gradient-to-r from-rose-50 to-rose-100/60 border border-rose-200 text-rose-900 text-xs flex items-center justify-between font-medium cursor-pointer hover:border-rose-400 hover:shadow-md transition group animate-in fade-in"
              title="Click to view AI Vision Evidence & Photo Reports"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-rose-200/80 text-rose-800 flex-shrink-0 group-hover:scale-105 transition">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-rose-900 font-bold text-xs flex items-center gap-1.5">
                    <span>Photo-Confirmed Waterlogging</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="text-[10px] text-rose-700 font-normal mt-0.5">
                    Click to view AI Vision evidence & citizen uploads
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold">
                  Active
                </span>
                <Eye className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowPhotoModal(true)}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-600 text-xs flex items-center justify-between cursor-pointer transition group"
              title="Click to submit a photo report for this ward"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-slate-200/70 text-slate-500 flex-shrink-0">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-slate-700 font-semibold text-xs">No Active Photos Reported</div>
                  <div className="text-[10px] text-slate-500 font-normal">Click to upload live field photo</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-sky-600 group-hover:underline flex items-center gap-0.5">
                Upload +
              </span>
            </div>
          )}

          {/* Live Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 flex items-center space-x-1 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Rainfall (3h)</span>
              </div>
              <div className="text-sm font-bold text-navy-900">{selectedWard?.rainfall_mm || 0} mm</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 flex items-center space-x-1 mb-1">
                <Car className="w-3.5 h-3.5 text-amber-500" />
                <span>Congestion</span>
              </div>
              <div className="text-sm font-bold text-navy-900">{selectedWard?.congestion_level || 0}%</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 flex items-center space-x-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Drainage Cap.</span>
              </div>
              <div className="text-sm font-bold text-navy-900">{selectedWard?.drainage_capacity || 0} mm/h</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 flex items-center space-x-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-burgundy-700" />
                <span>Dispatch State</span>
              </div>
              <div className="text-xs font-bold text-navy-900 font-mono">
                {selectedWard?.dispatch_status || "Unassigned"}
              </div>
            </div>
          </div>

          {/* Direct CTA to Safe Route */}
          <div className="pt-2">
            <Link
              href="/routes"
              className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <Navigation className="w-4 h-4 text-rose-300" />
              <span>Calculate Safe Route from here</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Endpoint Info & Status Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs bg-white px-4 py-3 rounded-card border border-slate-200 shadow-card-soft">
        <div className="inline-flex items-center space-x-2">
          {backendConnected ? (
            <div className="flex items-center space-x-2 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Live Endpoint Connected: <code className="text-navy-900 font-mono bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">/api/zones/risk/</code> (GeoJSON FeatureCollection)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-500">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Connected Endpoint: <code className="text-navy-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded">/api/zones/risk/</code> (GeoJSON FeatureCollection)</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 text-xs">
          {lastSyncTime && (
            <span className="text-[11px] text-slate-400 font-mono">
              Synced at {lastSyncTime}
            </span>
          )}
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}></span>
            <span className="font-semibold text-slate-700">10 Nagpur Wards Monitored in Real Time</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AI PHOTO EVIDENCE & VISION ANALYSIS MODAL DIALOG                          */}
      {/* ========================================================================= */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                    <span>Photo Evidence & AI Vision Analysis</span>
                    {selectedWard?.is_photo_confirmed && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                        AI Verified
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedWard?.name} • Ward Flood Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* AI Vision Model Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white text-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold">Hugging Face Vision ViT Inference Engine</div>
                    <div className="text-[11px] text-slate-300">Automated multi-class waterlogging & pothole detector</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                    Live Model
                  </span>
                </div>
              </div>

              {selectedWard?.is_photo_confirmed ? (
                <div className="space-y-3.5">
                  {/* Verified Incident Card 1 */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                        <h4 className="text-xs font-bold text-rose-950">
                          Active Inundation • Main Arterial Junction
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        94.2% AI Confidence
                      </span>
                    </div>

                    {/* Simulated Visual Evidence Canvas */}
                    <div className="relative rounded-lg overflow-hidden border border-rose-200 bg-slate-900 h-40 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent z-10"></div>
                      
                      {/* Flood visual graphic representation */}
                      <div className="absolute inset-0 flex flex-col justify-end p-3 z-20 text-white">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <Droplets className="w-3.5 h-3.5 text-sky-400" />
                            <span>Estimated Depth: 40 - 55 cm</span>
                          </div>
                          <span className="text-[10px] text-slate-300 font-mono">
                            GPS: [21.1475° N, 79.0650° E]
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 mt-1 line-clamp-1">
                          Standing flood water submerging roadway, vehicles stalled near Shankar Nagar square.
                        </p>
                      </div>

                      {/* AI Bounding Box Overlay */}
                      <div className="absolute top-6 left-10 right-10 bottom-12 border-2 border-rose-500 border-dashed rounded-lg flex items-start justify-end p-1 z-20 bg-rose-500/10">
                        <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          [Waterlogging: 0.94]
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Verification State</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified by NMC Officer
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Civic Priority</span>
                        <span className="font-bold text-burgundy-900 mt-0.5 block">
                          Priority 1 • High Inundation
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Incident Card 2 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-navy-900">Secondary Flow Accumulation</span>
                      <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        88.0% AI Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Drainage grate overflow causing street-level backflow near residential colony approach.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">No Active Waterlogging Photos</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      No citizen has reported verified waterlogging photos for {selectedWard?.name} in the last 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <Link
                href={`/report?zone=${encodeURIComponent(selectedWard?.name || "")}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <UploadCloud className="w-4 h-4 text-sky-300" />
                <span>Submit Citizen Hazard Photo</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
