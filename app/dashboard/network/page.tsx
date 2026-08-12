"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Router,
  Wifi,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Signal,
  Server,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type MikrotikDevice = {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  username: string;
  password: string;
  api_ssl: boolean;
  location: string | null;
  description: string | null;
  is_active: boolean;
  last_status: "online" | "offline" | "unknown" | "error";
  router_board: string | null;
  ros_version: string | null;
  uptime: string | null;
  last_seen: string | null;
};

type OltDevice = {
  id: string;
  name: string;
  ip_address: string;
  snmp_port: number;
  snmp_community: string;
  profile_type: string;
  pon_port_count: number;
  location: string | null;
  description: string | null;
  is_active: boolean;
  last_status: "online" | "offline" | "unknown" | "error";
  model: string | null;
  firmware: string | null;
  last_seen: string | null;
};

type OnuEntry = {
  id: string;
  onu_serial: string;
  pon_port: number | null;
  onu_id: number | null;
  onu_name: string | null;
  onu_status: "online" | "offline" | "unknown";
  rx_power: number | null;
  tx_power: number | null;
  distance: number | null;
  temperature: number | null;
  last_polled: string | null;
  customer?: { name: string; client_id: string } | null;
};

const OLT_PROFILES = [
  { value: "HIOSO_C", label: "HIOSO HA7304V (EPON)" },
  { value: "HIOSO_B2", label: "HIOSO HA7304C (EPON B)" },
  { value: "HIOSO_VX", label: "HIOSO HA7304VX (EPON)" },
  { value: "HIOSO_B", label: "BDCOM / Huawei Clone (EPON)" },
  { value: "HIOSO_GPON", label: "C-Data GPON" },
  { value: "CUSTOM", label: "Custom (Manual OID)" },
];

// ─── Modal Components ─────────────────────────────────────────────────────────

function MikrotikModal({
  device,
  onClose,
  onSave,
}: {
  device?: MikrotikDevice | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: device?.name ?? "",
    ip_address: device?.ip_address ?? "",
    port: device?.port ?? 8728,
    username: device?.username ?? "admin",
    password: device?.password ?? "",
    api_ssl: device?.api_ssl ?? false,
    location: device?.location ?? "",
    description: device?.description ?? "",
    is_active: device?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (device?.id) {
      await supabase.from("mikrotik_devices").update(form).eq("id", device.id);
    } else {
      await supabase.from("mikrotik_devices").insert(form);
    }
    setSaving(false);
    onSave();
    onClose();
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/network/mikrotik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: form.ip_address,
          port: form.port,
          username: form.username,
          password: form.password,
          ssl: form.api_ssl,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult({ ok: true, msg: `Connected! Board: ${data.board ?? "Unknown"}, ROS: ${data.version ?? "?"}` });
      } else {
        setTestResult({ ok: false, msg: data.error ?? "Connection failed" });
      }
    } catch {
      setTestResult({ ok: false, msg: "Network error — check if API route is configured" });
    }
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-muted rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-muted">
          <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
            <Router size={18} className="text-primary" />
            {device ? "Edit Mikrotik Device" : "Add Mikrotik Device"}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-on-surface-variant">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Device Name *
              </label>
              <input
                required
                className="form-input-dark text-sm w-full"
                placeholder="e.g. Core Router"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                IP Address *
              </label>
              <input
                required
                className="form-input-dark text-sm w-full"
                placeholder="192.168.1.1"
                value={form.ip_address}
                onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                API Port
              </label>
              <input
                type="number"
                className="form-input-dark text-sm w-full"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Username
              </label>
              <input
                className="form-input-dark text-sm w-full"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Password
              </label>
              <input
                type="password"
                className="form-input-dark text-sm w-full"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Location
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="e.g. Server Room A"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.api_ssl}
                onChange={(e) => setForm({ ...form, api_ssl: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-sm">Use SSL (port 8729)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                testResult.ok
                  ? "bg-status-optimal/10 text-status-optimal"
                  : "bg-status-outage/10 text-status-outage"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle size={14} />
              ) : (
                <XCircle size={14} />
              )}
              {testResult.msg}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={testConnection}
              disabled={testing || !form.ip_address}
              className="btn-secondary text-sm py-2 px-4 flex-shrink-0 disabled:opacity-50"
            >
              <Zap size={14} />
              {testing ? "Testing..." : "Test Connection"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm py-2 px-4 flex-1 disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OltModal({
  device,
  onClose,
  onSave,
}: {
  device?: OltDevice | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: device?.name ?? "",
    ip_address: device?.ip_address ?? "",
    snmp_port: device?.snmp_port ?? 161,
    snmp_community: device?.snmp_community ?? "public",
    profile_type: device?.profile_type ?? "HIOSO_C",
    pon_port_count: device?.pon_port_count ?? 4,
    location: device?.location ?? "",
    description: device?.description ?? "",
    model: device?.model ?? "",
    is_active: device?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollResult, setPollResult] = useState<{ ok: boolean; msg: string; onuCount?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (device?.id) {
      await supabase.from("olt_devices").update(form).eq("id", device.id);
    } else {
      await supabase.from("olt_devices").insert(form);
    }
    setSaving(false);
    onSave();
    onClose();
  };

  const pollOlt = async () => {
    setPolling(true);
    setPollResult(null);
    try {
      const res = await fetch("/api/network/olt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: form.ip_address,
          community: form.snmp_community,
          port: form.snmp_port,
          profile: form.profile_type,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setPollResult({ ok: true, msg: `OLT reachable!`, onuCount: data.onuCount });
      } else {
        setPollResult({ ok: false, msg: data.error ?? "Poll failed" });
      }
    } catch {
      setPollResult({ ok: false, msg: "Network error" });
    }
    setPolling(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-muted rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-muted">
          <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
            <Signal size={18} className="text-primary" />
            {device ? "Edit OLT Device" : "Add OLT Device"}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-on-surface-variant">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                OLT Name *
              </label>
              <input
                required
                className="form-input-dark text-sm w-full"
                placeholder="e.g. OLT-A Main"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                IP Address *
              </label>
              <input
                required
                className="form-input-dark text-sm w-full"
                placeholder="192.168.75.88"
                value={form.ip_address}
                onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                SNMP Port
              </label>
              <input
                type="number"
                className="form-input-dark text-sm w-full"
                value={form.snmp_port}
                onChange={(e) => setForm({ ...form, snmp_port: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                SNMP Community
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="public"
                value={form.snmp_community}
                onChange={(e) => setForm({ ...form, snmp_community: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                PON Ports
              </label>
              <input
                type="number"
                min={1}
                max={16}
                className="form-input-dark text-sm w-full"
                value={form.pon_port_count}
                onChange={(e) => setForm({ ...form, pon_port_count: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                OLT Profile Type
              </label>
              <select
                className="form-input-dark text-sm w-full"
                value={form.profile_type}
                onChange={(e) => setForm({ ...form, profile_type: e.target.value })}
              >
                {OLT_PROFILES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Model
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="e.g. HA7304V"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Location
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="e.g. Rack Room 2"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="olt_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="accent-primary"
            />
            <label htmlFor="olt_active" className="text-sm cursor-pointer">
              Active
            </label>
          </div>

          {pollResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                pollResult.ok
                  ? "bg-status-optimal/10 text-status-optimal"
                  : "bg-status-outage/10 text-status-outage"
              }`}
            >
              {pollResult.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {pollResult.msg}
              {pollResult.onuCount !== undefined && ` — ${pollResult.onuCount} ONUs found`}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={pollOlt}
              disabled={polling || !form.ip_address}
              className="btn-secondary text-sm py-2 px-4 flex-shrink-0 disabled:opacity-50"
            >
              <Zap size={14} />
              {polling ? "Polling..." : "Test SNMP"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm py-2 px-4 flex-1 disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save OLT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = "mikrotik" | "olt" | "onu";

export default function NetworkPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabType>("mikrotik");
  const [mikrotikDevices, setMikrotikDevices] = useState<MikrotikDevice[]>([]);
  const [oltDevices, setOltDevices] = useState<OltDevice[]>([]);
  const [onus, setOnus] = useState<OnuEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMikrotikModal, setShowMikrotikModal] = useState(false);
  const [showOltModal, setShowOltModal] = useState(false);
  const [editingMikrotik, setEditingMikrotik] = useState<MikrotikDevice | null>(null);
  const [editingOlt, setEditingOlt] = useState<OltDevice | null>(null);
  const [expandedOlt, setExpandedOlt] = useState<string | null>(null);
  const [onuFilter, setOnuFilter] = useState<"all" | "online" | "offline">("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [mikrotikRes, oltRes, onuRes] = await Promise.all([
      supabase.from("mikrotik_devices").select("*").order("created_at"),
      supabase.from("olt_devices").select("*").order("created_at"),
      supabase
        .from("onu_assignments")
        .select("*, customer:customers(name, client_id)")
        .order("onu_status")
        .order("pon_port"),
    ]);
    setMikrotikDevices(mikrotikRes.data ?? []);
    setOltDevices(oltRes.data ?? []);
    setOnus(onuRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteMikrotik = async (id: string) => {
    if (!confirm("Delete this Mikrotik device?")) return;
    await supabase.from("mikrotik_devices").delete().eq("id", id);
    fetchData();
  };

  const deleteOlt = async (id: string) => {
    if (!confirm("Delete this OLT device?")) return;
    await supabase.from("olt_devices").delete().eq("id", id);
    fetchData();
  };

  const refreshDeviceStatus = async (deviceType: "mikrotik" | "olt", id: string, ip: string, extra: Record<string, unknown> = {}) => {
    setRefreshing(true);
    try {
      const endpoint = deviceType === "mikrotik" ? "/api/network/mikrotik" : "/api/network/olt";
      const body = deviceType === "mikrotik"
        ? { ip, ...extra }
        : { ip, ...extra };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const status = data.ok ? "online" : "error";
      const updateData: Record<string, unknown> = { last_status: status, last_seen: new Date().toISOString() };
      if (data.ok && deviceType === "mikrotik") {
        updateData.router_board = data.board;
        updateData.ros_version = data.version;
        updateData.uptime = data.uptime;
      }
      await supabase.from(`${deviceType}_devices`).update(updateData).eq("id", id);
      fetchData();
    } catch {
      // ignore
    }
    setRefreshing(false);
  };

  const statusBadge = (status: string) => {
    if (status === "online")
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-status-optimal">
          <span className="w-1.5 h-1.5 rounded-full bg-status-optimal status-pulse" />
          ONLINE
        </span>
      );
    if (status === "offline")
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-status-outage">
          <span className="w-1.5 h-1.5 rounded-full bg-status-outage" />
          OFFLINE
        </span>
      );
    if (status === "error")
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-tertiary">
          <AlertTriangle size={10} />
          ERROR
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-on-surface-variant">
        <Clock size={10} />
        UNKNOWN
      </span>
    );
  };

  const filteredOnus = onus.filter(
    (o) => onuFilter === "all" || o.onu_status === onuFilter
  );

  const onlineCount = onus.filter((o) => o.onu_status === "online").length;
  const offlineCount = onus.filter((o) => o.onu_status === "offline").length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Router size={28} className="text-primary" /> Network Management
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Mikrotik routers, OLT devices &amp; ONU monitoring
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-lg bg-surface-card border border-border-muted hover:bg-surface-container transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "MIKROTIK ROUTERS",
            value: String(mikrotikDevices.length),
            sub: `${mikrotikDevices.filter((d) => d.last_status === "online").length} online`,
            color: "text-primary",
          },
          {
            label: "OLT DEVICES",
            value: String(oltDevices.length),
            sub: `${oltDevices.filter((d) => d.last_status === "online").length} online`,
            color: "text-tertiary",
          },
          {
            label: "ONUs ONLINE",
            value: String(onlineCount),
            sub: `of ${onus.length} total`,
            color: "text-status-optimal",
          },
          {
            label: "ONUs OFFLINE",
            value: String(offlineCount),
            sub: "needs attention",
            color: "text-status-outage",
          },
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="bg-surface-card border border-border-muted rounded-xl p-4"
          >
            <div className="font-mono text-[9px] tracking-widest text-on-surface-variant font-bold mb-2">
              {label}
            </div>
            <div className={`font-mono text-2xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-[10px] text-on-surface-variant mt-1">
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-card border border-border-muted rounded-xl p-1 w-fit">
        {(
          [
            { id: "mikrotik", label: "Mikrotik", icon: Router },
            { id: "olt", label: "OLT Devices", icon: Server },
            { id: "onu", label: "ONU Monitor", icon: Wifi },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-primary-container/20 text-primary border border-primary-container/30"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Mikrotik Tab ──────────────────────────────────────────── */}
      {activeTab === "mikrotik" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingMikrotik(null);
                setShowMikrotikModal(true);
              }}
              className="btn-primary text-sm py-2 px-4"
            >
              <Plus size={15} /> Add Mikrotik
            </button>
          </div>

          {loading ? (
            <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center text-on-surface-variant">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading devices...
            </div>
          ) : mikrotikDevices.length === 0 ? (
            <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center">
              <Router size={40} className="text-border-muted mx-auto mb-3" />
              <h3 className="font-grotesk font-semibold text-on-surface-variant mb-1">
                No Mikrotik Devices
              </h3>
              <p className="text-sm text-on-surface-variant/70">
                Add your first Mikrotik router to monitor &amp; manage it
              </p>
            </div>
          ) : (
            mikrotikDevices.map((device) => (
              <div
                key={device.id}
                className="bg-surface-card border border-border-muted rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        device.last_status === "online"
                          ? "bg-primary-container/20"
                          : "bg-surface-container"
                      }`}
                    >
                      <Router
                        size={18}
                        className={
                          device.last_status === "online"
                            ? "text-primary"
                            : "text-on-surface-variant"
                        }
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{device.name}</div>
                      <div className="font-mono text-xs text-on-surface-variant mt-0.5">
                        {device.ip_address}:{device.port}
                        {device.location && ` • ${device.location}`}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        {statusBadge(device.last_status)}
                        {device.router_board && (
                          <span className="font-mono text-[10px] text-on-surface-variant">
                            {device.router_board}
                          </span>
                        )}
                        {device.ros_version && (
                          <span className="font-mono text-[10px] text-on-surface-variant">
                            ROS {device.ros_version}
                          </span>
                        )}
                        {device.uptime && (
                          <span className="font-mono text-[10px] text-on-surface-variant">
                            Up: {device.uptime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        refreshDeviceStatus("mikrotik", device.id, device.ip_address, {
                          port: device.port,
                          username: device.username,
                          password: device.password,
                          ssl: device.api_ssl,
                        })
                      }
                      disabled={refreshing}
                      className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                      title="Ping device"
                    >
                      <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingMikrotik(device);
                        setShowMikrotikModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteMikrotik(device.id)}
                      className="p-2 rounded-lg hover:bg-status-outage/10 text-on-surface-variant hover:text-status-outage transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── OLT Tab ───────────────────────────────────────────────── */}
      {activeTab === "olt" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingOlt(null);
                setShowOltModal(true);
              }}
              className="btn-primary text-sm py-2 px-4"
            >
              <Plus size={15} /> Add OLT
            </button>
          </div>

          {loading ? (
            <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center text-on-surface-variant">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading OLT devices...
            </div>
          ) : oltDevices.length === 0 ? (
            <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center">
              <Server size={40} className="text-border-muted mx-auto mb-3" />
              <h3 className="font-grotesk font-semibold text-on-surface-variant mb-1">
                No OLT Devices
              </h3>
              <p className="text-sm text-on-surface-variant/70">
                Add your first OLT to begin monitoring ONUs via SNMP
              </p>
            </div>
          ) : (
            oltDevices.map((olt) => {
              const oltOnus = onus.filter(
                (o) =>
                  (o as OnuEntry & { olt_device_id?: string }).olt_device_id === olt.id
              );
              const isExpanded = expandedOlt === olt.id;

              return (
                <div
                  key={olt.id}
                  className="bg-surface-card border border-border-muted rounded-xl overflow-hidden"
                >
                  <div className="p-5 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          olt.last_status === "online"
                            ? "bg-tertiary/10"
                            : "bg-surface-container"
                        }`}
                      >
                        <Server
                          size={18}
                          className={
                            olt.last_status === "online"
                              ? "text-tertiary"
                              : "text-on-surface-variant"
                          }
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{olt.name}</div>
                        <div className="font-mono text-xs text-on-surface-variant mt-0.5">
                          {olt.ip_address} • {olt.snmp_community} •{" "}
                          {olt.profile_type}
                          {olt.location && ` • ${olt.location}`}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {statusBadge(olt.last_status)}
                          <span className="font-mono text-[10px] text-on-surface-variant">
                            {olt.pon_port_count} PON ports
                          </span>
                          {olt.model && (
                            <span className="font-mono text-[10px] text-on-surface-variant">
                              {olt.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedOlt(isExpanded ? null : olt.id)}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
                        title="Show ONUs"
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingOlt(olt);
                          setShowOltModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteOlt(olt.id)}
                        className="p-2 rounded-lg hover:bg-status-outage/10 text-on-surface-variant hover:text-status-outage transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border-muted">
                      {oltOnus.length === 0 ? (
                        <div className="p-6 text-center text-sm text-on-surface-variant">
                          No ONUs assigned to this OLT yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border-muted bg-surface-container/30">
                                {[
                                  "PON",
                                  "ONU ID",
                                  "SERIAL",
                                  "NAME",
                                  "CUSTOMER",
                                  "STATUS",
                                  "RX PWR",
                                  "TX PWR",
                                  "DIST",
                                ].map((h) => (
                                  <th
                                    key={h}
                                    className="px-4 py-2 text-left font-mono text-[9px] tracking-widest text-on-surface-variant"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {oltOnus.map((onu) => (
                                <tr
                                  key={onu.id}
                                  className="border-b border-border-muted/50 hover:bg-surface-container/30"
                                >
                                  <td className="px-4 py-2.5 font-mono text-xs">
                                    {onu.pon_port ?? "—"}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-xs">
                                    {onu.onu_id ?? "—"}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-xs text-primary">
                                    {onu.onu_serial}
                                  </td>
                                  <td className="px-4 py-2.5 text-xs">
                                    {onu.onu_name ?? "—"}
                                  </td>
                                  <td className="px-4 py-2.5 text-xs">
                                    {onu.customer?.name ?? (
                                      <span className="text-on-surface-variant">Unassigned</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    {onu.onu_status === "online" ? (
                                      <span className="font-mono text-[10px] font-bold text-status-optimal">
                                        ONLINE
                                      </span>
                                    ) : onu.onu_status === "offline" ? (
                                      <span className="font-mono text-[10px] font-bold text-status-outage">
                                        OFFLINE
                                      </span>
                                    ) : (
                                      <span className="font-mono text-[10px] font-bold text-on-surface-variant">
                                        UNKNOWN
                                      </span>
                                    )}
                                  </td>
                                  <td
                                    className={`px-4 py-2.5 font-mono text-xs ${
                                      onu.rx_power !== null && onu.rx_power > -25
                                        ? "text-status-optimal"
                                        : onu.rx_power !== null && onu.rx_power > -30
                                        ? "text-status-latency"
                                        : "text-status-outage"
                                    }`}
                                  >
                                    {onu.rx_power !== null
                                      ? `${onu.rx_power} dBm`
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-xs text-on-surface-variant">
                                    {onu.tx_power !== null
                                      ? `${onu.tx_power} dBm`
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-xs text-on-surface-variant">
                                    {onu.distance !== null
                                      ? `${onu.distance}m`
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── ONU Monitor Tab ──────────────────────────────────────── */}
      {activeTab === "onu" && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            {(["all", "online", "offline"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setOnuFilter(f)}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold tracking-widest transition-colors ${
                  onuFilter === f
                    ? f === "online"
                      ? "bg-status-optimal/20 text-status-optimal border border-status-optimal/30"
                      : f === "offline"
                      ? "bg-status-outage/20 text-status-outage border border-status-outage/30"
                      : "bg-primary-container/20 text-primary border border-primary-container/30"
                    : "bg-surface-card border border-border-muted text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {f.toUpperCase()}
                {f === "all" && ` (${onus.length})`}
                {f === "online" && ` (${onlineCount})`}
                {f === "offline" && ` (${offlineCount})`}
              </button>
            ))}
          </div>

          <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-muted">
                    {[
                      "OLT",
                      "PON",
                      "SERIAL",
                      "CUSTOMER",
                      "STATUS",
                      "RX POWER",
                      "TX POWER",
                      "DISTANCE",
                      "TEMP",
                      "LAST POLLED",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-mono text-[9px] tracking-widest text-on-surface-variant font-bold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-on-surface-variant"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Loading ONUs...
                        </div>
                      </td>
                    </tr>
                  ) : filteredOnus.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-on-surface-variant"
                      >
                        No ONUs found. Add OLT devices and assign ONUs.
                      </td>
                    </tr>
                  ) : (
                    filteredOnus.map((onu, i) => {
                      const rxColor =
                        onu.rx_power === null
                          ? "text-on-surface-variant"
                          : onu.rx_power > -25
                          ? "text-status-optimal"
                          : onu.rx_power > -30
                          ? "text-status-latency"
                          : "text-status-outage";

                      return (
                        <tr
                          key={onu.id}
                          className={`border-b border-border-muted/50 hover:bg-surface-container/40 transition-colors ${
                            i % 2 !== 0 ? "bg-[#1A1A24]/30" : ""
                          }`}
                        >
                          <td className="px-4 py-2.5 font-mono text-[10px] text-on-surface-variant">
                            {(onu as OnuEntry & { olt_device_id?: string }).olt_device_id
                              ? oltDevices.find(
                                  (o) =>
                                    o.id ===
                                    (onu as OnuEntry & { olt_device_id?: string }).olt_device_id
                                )?.name ?? "—"
                              : "—"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs">
                            {onu.pon_port ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-primary">
                            {onu.onu_serial}
                          </td>
                          <td className="px-4 py-2.5 text-xs">
                            {onu.customer ? (
                              <div>
                                <div className="font-medium">{onu.customer.name}</div>
                                <div className="font-mono text-[10px] text-on-surface-variant">
                                  {onu.customer.client_id}
                                </div>
                              </div>
                            ) : (
                              <span className="text-on-surface-variant">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {onu.onu_status === "online" ? (
                              <span className="font-mono text-[10px] font-bold text-status-optimal">
                                ● ONLINE
                              </span>
                            ) : onu.onu_status === "offline" ? (
                              <span className="font-mono text-[10px] font-bold text-status-outage">
                                ● OFFLINE
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] font-bold text-on-surface-variant">
                                — UNKNOWN
                              </span>
                            )}
                          </td>
                          <td className={`px-4 py-2.5 font-mono text-xs font-bold ${rxColor}`}>
                            {onu.rx_power !== null ? `${onu.rx_power} dBm` : "—"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-on-surface-variant">
                            {onu.tx_power !== null ? `${onu.tx_power} dBm` : "—"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-on-surface-variant">
                            {onu.distance !== null ? `${onu.distance}m` : "—"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-on-surface-variant">
                            {onu.temperature !== null ? `${onu.temperature}°C` : "—"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[10px] text-on-surface-variant">
                            {onu.last_polled
                              ? new Date(onu.last_polled).toLocaleString()
                              : "Never"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modals ───────────────────────────────────────────────── */}
      {showMikrotikModal && (
        <MikrotikModal
          device={editingMikrotik}
          onClose={() => setShowMikrotikModal(false)}
          onSave={fetchData}
        />
      )}
      {showOltModal && (
        <OltModal
          device={editingOlt}
          onClose={() => setShowOltModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
