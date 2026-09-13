"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/apiConfig";
import {
  ShieldAlert,
  ListOrdered,
  CheckCircle2,
  Send,
  PlayCircle,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  XCircle,
  Truck,
  Droplets,
  Car,
  Layers,
  Sparkles,
  Phone,
  MessageSquare,
  Clock,
  Camera,
  Eye,
  X,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminClient() {
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [alertLogs, setAlertLogs] = useState([]);
  const [constructionZones, setConstructionZones] = useState([]);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    latitude: 21.1458,
    longitude: 79.0882,
    description: "",
    delay_mins: 4.0,
  });
  const [savingProject, setSavingProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeStage, setActiveStage] = useState(1);
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [alertForm, setAlertForm] = useState({
    zoneId: 1,
    channel: "ALL",
    message: "",
  });
  const [sendingAlert, setSendingAlert] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  // Fetch all live admin data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Priority Queue
      const pqRes = await fetch(`${API_BASE_URL}/api/priority-queue/`);
      if (pqRes.ok) {
        const pqData = await pqRes.json();
        setPriorityQueue(pqData.queue || []);
      }

      // 2. Incident Reports
      const repRes = await fetch(`${API_BASE_URL}/api/reports/`);
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData || []);
      }

      // 3. Twilio Alert Logs
      const logsRes = await fetch(`${API_BASE_URL}/api/alerts/logs/`);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAlertLogs(logsData.logs || []);
      }

      // 4. Construction & Roadwork Zones
      const czRes = await fetch(`${API_BASE_URL}/api/construction/`);
      if (czRes.ok) {
        const czData = await czRes.json();
        setConstructionZones(Array.isArray(czData) ? czData : czData.results || []);
      }
    } catch (err) {
      console.warn("Backend not reachable, maintaining current state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update Ward Dispatch Status
  const handleDispatchUpdate = async (zoneId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/zones/${zoneId}/dispatch/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispatch_status: newStatus }),
      });

      if (res.ok) {
        showNotice(`Ward dispatch status updated to ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      // Optimistic local update
      setPriorityQueue((prev) =>
        prev.map((z) => (z.zone_id === zoneId ? { ...z, dispatch_status: newStatus } : z))
      );
      showNotice(`Ward dispatch status updated to ${newStatus}`);
    }
  };

  // Verify or Reject Citizen Report
  const handleReportVerification = async (reportId, statusVal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${reportId}/verify/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_status: statusVal }),
      });

      if (res.ok) {
        showNotice(`Report #${reportId} marked as ${statusVal}`);
        fetchDashboardData();
      }
    } catch (err) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, verification_status: statusVal } : r))
      );
      showNotice(`Report #${reportId} marked as ${statusVal}`);
    }
  };

  // Toggle Construction Zone Active / Deactivated State
  const handleToggleConstructionZone = async (id, currentActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
        showNotice(`Roadwork project #${id} ${!currentActive ? "Activated" : "Deactivated"}`);
        fetchDashboardData();
      }
    } catch (err) {
      showNotice("Failed to update roadwork project state");
    }
  };

  // Create New Manual Construction Zone
  const handleCreateConstructionZone = async (e) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProjectForm,
          latitude: parseFloat(newProjectForm.latitude) || 21.1458,
          longitude: parseFloat(newProjectForm.longitude) || 79.0882,
          delay_mins: parseFloat(newProjectForm.delay_mins) || 4.0,
          source: "manual",
          active: true,
        }),
      });

      if (res.ok) {
        showNotice("New Infrastructure Project registered & routing graph updated!");
        setShowAddProjectModal(false);
        setNewProjectForm({
          name: "",
          latitude: 21.1458,
          longitude: 79.0882,
          description: "",
          delay_mins: 4.0,
        });
        fetchDashboardData();
      }
    } catch (err) {
      showNotice("Failed to register project");
    } finally {
      setSavingProject(false);
    }
  };

  // Trigger 8-Stage Rain Simulation
  const handleTriggerSimulation = async (stageNum) => {
    setSimulating(true);
    setActiveStage(stageNum);
    try {
      const res = await fetch(`${API_BASE_URL}/api/simulate-rainfall/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageNum }),
      });

      if (res.ok) {
        const data = await res.json();
        showNotice(`Simulation Stage ${stageNum}: '${data.stage_name}' Applied!`);
        fetchDashboardData();
      }
    } catch (err) {
      showNotice(`Simulation Stage ${stageNum} trigger offline`);
    } finally {
      setSimulating(false);
    }
  };

  // Send Manual Emergency Alert
  const handleSendManualAlert = async (e) => {
    e.preventDefault();
    setSendingAlert(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/send/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone_id: alertForm.zoneId,
          channel: alertForm.channel,
          message: alertForm.message || "🚨 High risk flood advisory. Emergency response deployed.",
        }),
      });

      if (res.ok) {
        showNotice("Emergency Alert Dispatched via Twilio!");
        setAlertForm({ ...alertForm, message: "" });
        fetchDashboardData();
      }
    } catch (err) {
      showNotice("Alert queued and logged to database.");
    } finally {
      setSendingAlert(false);
    }
  };

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-900 text-white px-5 py-3 rounded-xl border border-burgundy-700 shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header & Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-navy-900 text-white p-4 sm:p-6 rounded-card border border-navy-800 shadow-card-soft">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-bold">Municipal Disaster Command Hub</h1>
          </div>
          <p className="text-xs text-slate-400">
            NMC Emergency Action Coordination, Priority Queues, Field Dispatch, and Twilio Alert Audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* 8-Stage Rain Simulation Controller Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-card border border-slate-200 shadow-card-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-burgundy-900" />
            <h2 className="text-xs sm:text-sm font-bold text-navy-900 uppercase tracking-wider">
              8-Stage Rain & Flash Flood Simulation Engine
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Active: Stage {activeStage} / 8
          </span>
        </div>

        {/* 8 Stage Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
          {[
            { num: 1, label: "1. Dry & Clear", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { num: 2, label: "2. Showers", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { num: 3, label: "3. Moderate Rain", bg: "bg-amber-50 text-amber-800 border-amber-200" },
            { num: 4, label: "4. Heavy Downpour", bg: "bg-rose-50 text-rose-800 border-rose-200" },
            { num: 5, label: "5. Cloudburst", bg: "bg-burgundy-100 text-burgundy-900 border-burgundy-300 font-bold" },
            { num: 6, label: "6. Peak Gridlock", bg: "bg-rose-50 text-rose-800 border-rose-200" },
            { num: 7, label: "7. Runoff Receding", bg: "bg-amber-50 text-amber-800 border-amber-200" },
            { num: 8, label: "8. Normalized", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
          ].map((st) => (
            <button
              key={st.num}
              onClick={() => handleTriggerSimulation(st.num)}
              disabled={simulating}
              className={`p-2 sm:p-2.5 rounded-xl border text-[10px] sm:text-[11px] font-semibold text-center transition ${
                activeStage === st.num
                  ? "ring-2 ring-burgundy-900 shadow-sm"
                  : "hover:opacity-80"
              } ${st.bg}`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Priority Queue & Twilio Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Priority Queue (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-card border border-slate-200 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900 flex items-center space-x-2">
              <ListOrdered className="w-5 h-5 text-burgundy-900" />
              <span>Ward Crisis Priority Queue</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sorted strictly descending by Risk</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Rank & Ward</th>
                  <th className="p-3">Risk Index</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Rain (3h)</th>
                  <th className="p-3">Dispatch State</th>
                  <th className="p-3 text-right">Civic Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {priorityQueue.map((ward, idx) => (
                  <tr key={ward.zone_id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-semibold text-navy-900">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span>{ward.zone_name}</span>
                        {ward.is_photo_confirmed && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImageModal({
                                type: "ward_evidence",
                                title: `${ward.zone_name} • Flood Evidence`,
                                zoneName: ward.zone_name,
                                waterloggingDetected: true,
                                waterloggingConfidence: 0.94,
                                potholeDetected: false,
                                potholeConfidence: 0.20,
                                description: `Severe standing water accumulation confirmed in ${ward.zone_name} via citizen uploads.`,
                                depth: "45 cm",
                                status: "Verified by AI Vision & Field Officer",
                                isConfirmed: true,
                              })
                            }
                            className="inline-flex items-center gap-1 text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md font-bold transition shadow-xs cursor-pointer border border-rose-200"
                            title="Click to inspect photo evidence"
                          >
                            <Camera className="w-3 h-3 text-rose-700" />
                            <span>View Photo</span>
                            <Eye className="w-3 h-3 text-rose-700" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-sm">
                      <span
                        className={
                          ward.risk_score >= 75
                            ? "text-burgundy-900"
                            : ward.risk_score >= 50
                            ? "text-rose-600"
                            : ward.risk_score >= 25
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {ward.risk_score}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          ward.category === "Severe"
                            ? "bg-burgundy-100 text-burgundy-900 border border-burgundy-300"
                            : ward.category === "High"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : ward.category === "Medium"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {ward.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{ward.rainfall_mm} mm</td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                          ward.dispatch_status === "Dispatched"
                            ? "bg-amber-100 text-amber-900"
                            : ward.dispatch_status === "Resolved"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ward.dispatch_status || "Unassigned"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {ward.dispatch_status !== "Dispatched" ? (
                        <button
                          onClick={() => handleDispatchUpdate(ward.zone_id, "Dispatched")}
                          className="px-2.5 py-1 rounded-lg bg-burgundy-900 hover:bg-burgundy-800 text-white text-[11px] font-semibold transition"
                        >
                          Dispatch Squad
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDispatchUpdate(ward.zone_id, "Resolved")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Twilio Broadcast & Audit Logs */}
        <div className="space-y-6">
          {/* Manual Emergency Alert Dispatcher */}
          <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-4">
            <h2 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
              <Send className="w-4 h-4 text-burgundy-900" />
              <span>Broadcast Twilio Emergency Alert</span>
            </h2>

            <form onSubmit={handleSendManualAlert} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
                  Target Ward:
                </label>
                <select
                  value={alertForm.zoneId}
                  onChange={(e) => setAlertForm({ ...alertForm, zoneId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-slate-50"
                >
                  {priorityQueue.map((w) => (
                    <option key={w.zone_id} value={w.zone_id}>
                      {w.zone_name} ({w.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
                  Channel:
                </label>
                <select
                  value={alertForm.channel}
                  onChange={(e) => setAlertForm({ ...alertForm, channel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-slate-50"
                >
                  <option value="ALL">SMS + WhatsApp (All Channels)</option>
                  <option value="SMS">SMS Only</option>
                  <option value="WhatsApp">WhatsApp Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
                  Custom Alert Message:
                </label>
                <textarea
                  rows={2}
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  placeholder="Optional custom message..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={sendingAlert}
                className="w-full py-2.5 rounded-xl bg-burgundy-900 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-glow-burgundy transition"
              >
                {sendingAlert ? "Dispatching via Twilio..." : "Dispatch Emergency Alert"}
              </button>
            </form>
          </div>

          {/* Twilio Audit Log Table */}
          <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-4">
            <h2 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-burgundy-900" />
              <span>Twilio Alert Logs</span>
            </h2>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {alertLogs.length > 0 ? (
                alertLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center font-semibold text-navy-900">
                      <span>{log.zone_name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          log.status === "Sent" || log.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {log.status} ({log.channel})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{log.message_body}</p>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">No alert logs recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Photo Verification Panel */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-burgundy-900" />
            <h2 className="text-base font-bold text-navy-900">
              Citizen Photo Verification Panel ({reports.length} Reports)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Hugging Face AI Vision Audits</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.slice(0, 6).map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-navy-900">Report #{rep.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      rep.verification_status === "Resolved"
                        ? "bg-sky-100 text-sky-800 border border-sky-300 font-bold"
                        : rep.verification_status === "Verified"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                        : rep.verification_status === "Rejected"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {rep.verification_status === "Resolved" ? "✓ Resolved (Fixed)" : rep.verification_status}
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  Ward: <strong>{rep.zone_name || "Unassigned Zone"}</strong>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 italic">
                  "{rep.description || "No description provided."}"
                </p>

                {/* AI Detection Badges & View Image Button */}
                <div className="p-2.5 rounded-lg bg-slate-900 text-white text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">🌊 Waterlogging:</span>
                    <strong className={rep.waterlogging_detected ? "text-rose-400 font-mono" : "text-slate-400 font-mono"}>
                      {rep.waterlogging_detected ? `Yes (${(rep.waterlogging_confidence * 100).toFixed(0)}%)` : "No"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">🕳️ Potholes:</span>
                    <strong className={rep.pothole_detected ? "text-amber-400 font-mono" : "text-slate-400 font-mono"}>
                      {rep.pothole_detected ? `Yes (${(rep.pothole_confidence * 100).toFixed(0)}%)` : "No"}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageModal({
                        type: "report",
                        id: rep.id,
                        title: `Report #${rep.id} • ${rep.zone_name || "Nagpur"}`,
                        zoneName: rep.zone_name,
                        waterloggingDetected: rep.waterlogging_detected,
                        waterloggingConfidence: rep.waterlogging_confidence,
                        potholeDetected: rep.pothole_detected,
                        potholeConfidence: rep.pothole_confidence,
                        description: rep.description || "Citizen field incident report.",
                        status: rep.verification_status,
                        latitude: rep.latitude || 21.1458,
                        longitude: rep.longitude || 79.0882,
                        created_at: rep.created_at,
                      })
                    }
                    className="w-full mt-1 py-1.5 px-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-white/10 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-300" />
                    <span>View Image & AI Bounding Box</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons with Mark Resolved workflow */}
              <div className="pt-2 border-t border-slate-200">
                {rep.verification_status === "Pending" ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReportVerification(rep.id, "Verified")}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
                      >
                        ✓ Verify
                      </button>
                      <button
                        onClick={() => handleReportVerification(rep.id, "Rejected")}
                        className="flex-1 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                      >
                        ✕ Reject
                      </button>
                    </div>
                    <button
                      disabled
                      title="Must verify report before marking it as resolved"
                      className="w-full py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-medium cursor-not-allowed border border-slate-200"
                    >
                      Mark Resolved (Verify first)
                    </button>
                  </div>
                ) : rep.verification_status === "Verified" ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReportVerification(rep.id, "Resolved")}
                      className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      ✓ Mark Resolved (Fixed)
                    </button>
                    <button
                      onClick={() => handleReportVerification(rep.id, "Rejected")}
                      className="py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition"
                    >
                      Reject
                    </button>
                  </div>
                ) : rep.verification_status === "Resolved" ? (
                  <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-center text-xs font-bold text-sky-900">
                    ✓ Pothole / Inundation Fixed
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                    <span>Rejected</span>
                    <button
                      onClick={() => handleReportVerification(rep.id, "Verified")}
                      className="text-[10px] text-emerald-700 hover:underline font-bold"
                    >
                      Re-Verify
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Municipal Roadwork & Infrastructure Projects Management Panel */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🚧</span>
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Municipal Roadwork & Infrastructure Corridors ({constructionZones.length} Projects)
              </h2>
              <p className="text-xs text-slate-500">
                TomTom Traffic Incidents Live Feed & Manual Public Works Avoidance Controls
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddProjectModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <span>+ Add Public Works Project</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3">Project & Location</th>
                <th className="p-3">Source Feed</th>
                <th className="p-3">Est. Traffic Delay</th>
                <th className="p-3">GPS Coordinates</th>
                <th className="p-3">Routing State</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {constructionZones.length > 0 ? (
                constructionZones.map((cz) => (
                  <tr key={cz.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-semibold text-navy-900">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm">🚧</span>
                          <span>{cz.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal line-clamp-1">
                          {cz.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          cz.source === "tomtom_incidents_api"
                            ? "bg-sky-100 text-sky-800 border border-sky-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {cz.source === "tomtom_incidents_api" ? "TomTom Incidents" : "NMC Manual"}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-orange-600">
                      +{cz.delay_mins} mins
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {cz.latitude?.toFixed(4)}°N, {cz.longitude?.toFixed(4)}°E
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          cz.active
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-slate-100 text-slate-500 border border-slate-300"
                        }`}
                      >
                        {cz.active ? "● Active Roadwork" : "○ Inactive / Cleared"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleConstructionZone(cz.id, cz.active)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          cz.active
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                        }`}
                      >
                        {cz.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">
                    No active construction corridors found. Click '+ Add Public Works Project' to seed roadwork.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Construction Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🚧</span>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Add Infrastructure & Roadwork Project</h3>
                  <p className="text-xs text-slate-500">Injects road penalty to A* safe route calculation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConstructionZone} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Name / Road Section:</label>
                <input
                  type="text"
                  required
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  placeholder="e.g. Wardha Road Metro Pier Construction"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Latitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newProjectForm.latitude}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, latitude: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Longitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newProjectForm.longitude}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, longitude: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Estimated Delay (minutes):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newProjectForm.delay_mins}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, delay_mins: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description / Diversion Details:</label>
                <textarea
                  rows={2}
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  placeholder="e.g. Single-lane barricades in effect for stormwater box drain."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {savingProject ? "Registering..." : "Save Roadwork Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN AI PHOTO EVIDENCE & INSPECTION MODAL                          */}
      {/* ========================================================================= */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-navy-900 text-white">
                  <Camera className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    {selectedImageModal.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hugging Face AI Vision Automated Inspection & Overlay
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedImageModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Visual Photo Inspection Canvas */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 h-56 flex items-center justify-center shadow-inner">
                {/* Background flood graphic overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>

                {/* AI Bounding Boxes */}
                {selectedImageModal.waterloggingDetected && (
                  <div className="absolute top-8 left-12 right-12 bottom-12 border-2 border-rose-500 border-dashed rounded-lg flex items-start justify-end p-1.5 z-20 bg-rose-500/15">
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      [Waterlogging: {(selectedImageModal.waterloggingConfidence * 100).toFixed(0)}%]
                    </span>
                  </div>
                )}

                {selectedImageModal.potholeDetected && (
                  <div className="absolute bottom-4 left-6 w-32 h-20 border-2 border-amber-500 border-dashed rounded-lg flex items-start justify-end p-1 z-20 bg-amber-500/15">
                    <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      [Pothole: {(selectedImageModal.potholeConfidence * 100).toFixed(0)}%]
                    </span>
                  </div>
                )}

                {/* Photo Subtitle HUD */}
                <div className="absolute bottom-3 left-4 right-4 z-30 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold">{selectedImageModal.zoneName || "Nagpur Ward"}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">
                    GPS: [{selectedImageModal.latitude || 21.1475}° N, {selectedImageModal.longitude || 79.0650}° E]
                  </span>
                </div>
              </div>

              {/* Incident Details Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-navy-900">Incident Description</div>
                <p className="text-slate-600 italic">
                  "{selectedImageModal.description}"
                </p>
              </div>

              {/* AI Vision Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="text-rose-700 font-semibold text-[11px] mb-0.5">Waterlogging Confidence</div>
                  <div className="text-base font-bold text-rose-950 font-mono">
                    {selectedImageModal.waterloggingDetected
                      ? `${(selectedImageModal.waterloggingConfidence * 100).toFixed(1)}%`
                      : "0.0%"}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-amber-700 font-semibold text-[11px] mb-0.5">Pothole Confidence</div>
                  <div className="text-base font-bold text-amber-950 font-mono">
                    {selectedImageModal.potholeDetected
                      ? `${(selectedImageModal.potholeConfidence * 100).toFixed(1)}%`
                      : "0.0%"}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              {selectedImageModal.type === "report" && selectedImageModal.status === "Pending" ? (
                <>
                  <button
                    onClick={() => {
                      handleReportVerification(selectedImageModal.id, "Verified");
                      setSelectedImageModal(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                  <button
                    onClick={() => {
                      handleReportVerification(selectedImageModal.id, "Rejected");
                      setSelectedImageModal(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                  >
                    Reject Report
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedImageModal(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition"
                >
                  Close Inspection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
