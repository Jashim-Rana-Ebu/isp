"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, ArrowLeft, Zap, Upload } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [subZones, setSubZones] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    package_id: "",
    zone_id: "",
    sub_zone_id: "",
    ip_address: "",
    pppoe_username: "",
    pppoe_password: "",
    mac_address: "",
    onu_serial: "",
    install_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      const [{ data: pkgs }, { data: zns }] = await Promise.all([
        supabase.from("packages").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("zones").select("*").eq("is_active", true).order("name"),
      ]);
      setPackages(pkgs ?? []);
      setZones(zns ?? []);
    };
    load();
  }, []);

  useEffect(() => {
    if (form.zone_id) {
      supabase
        .from("sub_zones")
        .select("*")
        .eq("zone_id", form.zone_id)
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => setSubZones(data ?? []));
    } else {
      setSubZones([]);
    }
  }, [form.zone_id]);

  const update = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from("customers").insert({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        package_id: form.package_id || null,
        zone_id: form.zone_id || null,
        sub_zone_id: form.sub_zone_id || null,
        ip_address: form.ip_address || null,
        pppoe_username: form.pppoe_username || null,
        pppoe_password: form.pppoe_password || null,
        mac_address: form.mac_address || null,
        onu_serial: form.onu_serial || null,
        install_date: form.install_date || null,
        notes: form.notes || null,
        status: "active",
      });

      if (dbError) throw dbError;
      router.push("/dashboard/customers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "form-input-dark text-sm";
  const labelClass = "block text-sm font-medium text-on-surface-variant mb-1";

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/customers"
          className="w-10 h-10 rounded-lg bg-surface-container border border-border-muted flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-grotesk text-2xl font-bold flex items-center gap-2">
            <UserPlus size={24} className="text-primary" />
            Add New Customer
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Register a new client in the system
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface-card border border-border-muted rounded-2xl p-6 md:p-8">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-error-container/20 border border-error/40 text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="font-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Full Name <span className="text-status-outage">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Customer full name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Install Date
                </label>
                <input
                  type="date"
                  value={form.install_date}
                  onChange={(e) => update("install_date", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelClass}>Address</label>
              <input
                type="text"
                placeholder="House, Road, Block, Area"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Service Info */}
          <div>
            <h3 className="font-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              Service Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Internet Package</label>
                <select
                  value={form.package_id}
                  onChange={(e) => update("package_id", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Package</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ৳{Number(p.price).toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Zone</label>
                <select
                  value={form.zone_id}
                  onChange={(e) => {
                    update("zone_id", e.target.value);
                    update("sub_zone_id", "");
                  }}
                  className={inputClass}
                >
                  <option value="">Select Zone</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Sub Zone</label>
                <select
                  value={form.sub_zone_id}
                  onChange={(e) => update("sub_zone_id", e.target.value)}
                  className={inputClass}
                  disabled={!form.zone_id}
                >
                  <option value="">Select Sub Zone</option>
                  {subZones.map((sz) => (
                    <option key={sz.id} value={sz.id}>
                      {sz.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>IP Address</label>
                <input
                  type="text"
                  placeholder="192.168.x.x"
                  value={form.ip_address}
                  onChange={(e) => update("ip_address", e.target.value)}
                  className={inputClass + " font-mono"}
                />
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div>
            <h3 className="font-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              Network Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>PPPoE Username</label>
                <input
                  type="text"
                  placeholder="pppoe_user"
                  value={form.pppoe_username}
                  onChange={(e) => update("pppoe_username", e.target.value)}
                  className={inputClass + " font-mono"}
                />
              </div>
              <div>
                <label className={labelClass}>PPPoE Password</label>
                <input
                  type="text"
                  placeholder="pppoe_pass"
                  value={form.pppoe_password}
                  onChange={(e) => update("pppoe_password", e.target.value)}
                  className={inputClass + " font-mono"}
                />
              </div>
              <div>
                <label className={labelClass}>MAC Address</label>
                <input
                  type="text"
                  placeholder="AA:BB:CC:DD:EE:FF"
                  value={form.mac_address}
                  onChange={(e) => update("mac_address", e.target.value)}
                  className={inputClass + " font-mono"}
                />
              </div>
              <div>
                <label className={labelClass}>ONU Serial</label>
                <input
                  type="text"
                  placeholder="HWTC12345678"
                  value={form.onu_serial}
                  onChange={(e) => update("onu_serial", e.target.value)}
                  className={inputClass + " font-mono"}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={3}
              placeholder="Additional notes about this customer..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4 border-t border-border-muted">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm disabled:opacity-60"
            >
              <Zap size={16} />
              {loading ? "Creating..." : "Create Customer"}
            </button>
            <Link
              href="/dashboard/customers"
              className="btn-secondary text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
