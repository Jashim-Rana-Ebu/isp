"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings as SettingsIcon,
  Save,
  Building2,
  CreditCard,
  Router,
  Server,
  Smartphone,
  Globe,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";

const SECTIONS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "network", label: "Network", icon: Router },
  { id: "sslcommerz", label: "SSLCommerz", icon: Globe },
  { id: "bkash", label: "bKash", icon: Smartphone },
  { id: "paybill", label: "PayBill", icon: CreditCard },
];

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("company");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("settings").select("key, value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((s: { key: string; value: string | null }) => (map[s.key] = s.value || ""));
      setSettings(map);
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (categoryKeys: string[], sectionId: string) => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      for (const key of categoryKeys) {
        await supabase
          .from("settings")
          .update({ value: settings[key] ?? "" })
          .eq("key", key);
      }
      setSaveSuccess(sectionId);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      alert("Failed to save settings.");
    }
    setSaving(false);
  };

  const inputClass = "form-input-dark text-sm w-full";
  const labelClass = "block text-xs font-medium text-on-surface-variant mb-1.5 mt-4";

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-on-surface-variant">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading settings...
      </div>
    );
  }

  const SaveButton = ({
    keys,
    sectionId,
  }: {
    keys: string[];
    sectionId: string;
  }) => (
    <button
      onClick={() => handleSave(keys, sectionId)}
      disabled={saving}
      className="btn-primary text-sm mt-5 disabled:opacity-60"
    >
      {saving ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving...
        </>
      ) : saveSuccess === sectionId ? (
        <>
          <CheckCircle size={15} /> Saved!
        </>
      ) : (
        <>
          <Save size={15} /> Save Changes
        </>
      )}
    </button>
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
          <SettingsIcon size={28} className="text-primary" /> System Settings
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Configure your ISP billing system, integrations &amp; network devices
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="lg:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  activeSection === id
                    ? "bg-primary-container/20 text-primary border border-primary-container/30"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* ─── Company ─────────────────────────────────────── */}
          {activeSection === "company" && (
            <div className="bg-surface-card border border-border-muted rounded-xl p-6">
              <h2 className="font-grotesk font-semibold text-lg flex items-center gap-2 mb-1">
                <Building2 size={18} className="text-primary" /> Company Profile
              </h2>
              <p className="text-on-surface-variant text-xs mb-5">
                Your ISP business information displayed on invoices and the portal
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input
                    className={inputClass}
                    value={settings.company_name ?? ""}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={settings.company_phone ?? ""}
                    onChange={(e) =>
                      handleChange("company_phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={settings.company_email ?? ""}
                    onChange={(e) =>
                      handleChange("company_email", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input
                    className={inputClass}
                    placeholder="https://..."
                    value={settings.company_website ?? ""}
                    onChange={(e) =>
                      handleChange("company_website", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input
                    className={inputClass}
                    value={settings.company_address ?? ""}
                    onChange={(e) =>
                      handleChange("company_address", e.target.value)
                    }
                  />
                </div>
              </div>
              <SaveButton
                keys={[
                  "company_name",
                  "company_phone",
                  "company_email",
                  "company_address",
                  "company_website",
                ]}
                sectionId="company"
              />
            </div>
          )}

          {/* ─── Billing ─────────────────────────────────────── */}
          {activeSection === "billing" && (
            <div className="bg-surface-card border border-border-muted rounded-xl p-6">
              <h2 className="font-grotesk font-semibold text-lg flex items-center gap-2 mb-1">
                <CreditCard size={18} className="text-primary" /> Billing
                Configuration
              </h2>
              <p className="text-on-surface-variant text-xs mb-5">
                Invoice generation settings, due dates, currency &amp; auto-suspend
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Isolir Day (Auto-suspend unpaid customers)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    className={inputClass}
                    value={settings.isolir_day ?? ""}
                    onChange={(e) => handleChange("isolir_day", e.target.value)}
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Day of month to automatically suspend unpaid customers
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Invoice Due Days</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={settings.invoice_due_days ?? ""}
                    onChange={(e) =>
                      handleChange("invoice_due_days", e.target.value)
                    }
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Days after invoice creation before it&apos;s due
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Currency Symbol</label>
                  <input
                    className={inputClass}
                    value={settings.currency_symbol ?? ""}
                    onChange={(e) =>
                      handleChange("currency_symbol", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Currency Code</label>
                  <input
                    className={inputClass}
                    value={settings.currency_code ?? ""}
                    onChange={(e) =>
                      handleChange("currency_code", e.target.value)
                    }
                  />
                </div>
              </div>
              <SaveButton
                keys={[
                  "isolir_day",
                  "invoice_due_days",
                  "currency_symbol",
                  "currency_code",
                ]}
                sectionId="billing"
              />
            </div>
          )}

          {/* ─── Network ─────────────────────────────────────── */}
          {activeSection === "network" && (
            <div className="bg-surface-card border border-border-muted rounded-xl p-6">
              <h2 className="font-grotesk font-semibold text-lg flex items-center gap-2 mb-1">
                <Router size={18} className="text-primary" /> Network Settings
              </h2>
              <p className="text-on-surface-variant text-xs mb-5">
                Mikrotik API, OLT SNMP polling, and network monitoring defaults
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Default Mikrotik API Port</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={settings.mikrotik_default_port ?? "8728"}
                    onChange={(e) =>
                      handleChange("mikrotik_default_port", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>OLT SNMP Timeout (ms)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={settings.olt_snmp_timeout ?? "5000"}
                    onChange={(e) =>
                      handleChange("olt_snmp_timeout", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Network Poll Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min={60}
                    className={inputClass}
                    value={settings.network_poll_interval ?? "300"}
                    onChange={(e) =>
                      handleChange("network_poll_interval", e.target.value)
                    }
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    How often to poll OLT/Mikrotik status (min 60s)
                  </p>
                </div>
              </div>
              <div className="mt-5 p-4 bg-surface-container rounded-xl border border-border-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Server size={14} className="text-on-surface-variant" />
                  <span className="text-sm font-medium">Device Management</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-3">
                  To add Mikrotik routers and OLT devices, go to the{" "}
                  <strong>Network Management</strong> page. Settings here only
                  control global defaults.
                </p>
                <a
                  href="/dashboard/network"
                  className="btn-secondary text-xs py-1.5 px-3 inline-flex"
                >
                  <Router size={13} /> Go to Network Management
                </a>
              </div>
              <SaveButton
                keys={[
                  "mikrotik_default_port",
                  "olt_snmp_timeout",
                  "network_poll_interval",
                ]}
                sectionId="network"
              />
            </div>
          )}

          {/* ─── SSLCommerz ──────────────────────────────────── */}
          {activeSection === "sslcommerz" && (
            <div className="bg-surface-card border border-border-muted rounded-xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-grotesk font-semibold text-lg flex items-center gap-2">
                  <Globe size={18} className="text-primary" /> SSLCommerz
                  Integration
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  BD Payment Gateway
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mb-5">
                Configure SSLCommerz for online payment processing
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="ssl_sandbox"
                    checked={settings.sslcommerz_sandbox === "true"}
                    onChange={(e) =>
                      handleChange(
                        "sslcommerz_sandbox",
                        e.target.checked ? "true" : "false"
                      )
                    }
                    className="accent-primary"
                  />
                  <label htmlFor="ssl_sandbox" className="text-sm cursor-pointer">
                    Sandbox Mode (Testing)
                  </label>
                </div>
                <div>
                  <label className={labelClass}>Store ID</label>
                  <input
                    className={inputClass}
                    placeholder="your_store_id"
                    value={settings.sslcommerz_store_id ?? ""}
                    onChange={(e) =>
                      handleChange("sslcommerz_store_id", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Store Password</label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    value={settings.sslcommerz_store_password ?? ""}
                    onChange={(e) =>
                      handleChange("sslcommerz_store_password", e.target.value)
                    }
                  />
                </div>
              </div>
              <SaveButton
                keys={[
                  "sslcommerz_sandbox",
                  "sslcommerz_store_id",
                  "sslcommerz_store_password",
                ]}
                sectionId="sslcommerz"
              />
            </div>
          )}

          {/* ─── bKash ───────────────────────────────────────── */}
          {activeSection === "bkash" && (
            <div className="bg-surface-card border border-border-muted rounded-xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-grotesk font-semibold text-lg flex items-center gap-2">
                  <Smartphone size={18} className="text-primary" /> bKash
                  Integration
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary">
                  Mobile Banking
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mb-5">
                Configure bKash PGW for mobile payment processing
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="bkash_sandbox"
                    checked={settings.bkash_sandbox === "true"}
                    onChange={(e) =>
                      handleChange(
                        "bkash_sandbox",
                        e.target.checked ? "true" : "false"
                      )
                    }
                    className="accent-primary"
                  />
                  <label htmlFor="bkash_sandbox" className="text-sm cursor-pointer">
                    Sandbox Mode (Testing)
                  </label>
                </div>
                <div>
                  <label className={labelClass}>App Key</label>
                  <input
                    className={inputClass}
                    placeholder="bKash App Key"
                    value={settings.bkash_app_key ?? ""}
                    onChange={(e) =>
                      handleChange("bkash_app_key", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>App Secret</label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    value={settings.bkash_app_secret ?? ""}
                    onChange={(e) =>
                      handleChange("bkash_app_secret", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Username</label>
                  <input
                    className={inputClass}
                    value={settings.bkash_username ?? ""}
                    onChange={(e) =>
                      handleChange("bkash_username", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    value={settings.bkash_password ?? ""}
                    onChange={(e) =>
                      handleChange("bkash_password", e.target.value)
                    }
                  />
                </div>
              </div>
              <SaveButton
                keys={[
                  "bkash_sandbox",
                  "bkash_app_key",
                  "bkash_app_secret",
                  "bkash_username",
                  "bkash_password",
                ]}
                sectionId="bkash"
              />
            </div>
          )}

          {/* ─── PayBill ─────────────────────────────────────── */}
          {activeSection === "paybill" && (
            <div className="bg-surface-card border border-border-muted rounded-xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-grotesk font-semibold text-lg flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" /> PayBill
                  Integration
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-status-optimal/10 text-status-optimal">
                  ISP Gateway
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mb-5">
                Configure PayBill API for ISP-specific billing collections
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="paybill_sandbox"
                    checked={settings.paybill_sandbox === "true"}
                    onChange={(e) =>
                      handleChange(
                        "paybill_sandbox",
                        e.target.checked ? "true" : "false"
                      )
                    }
                    className="accent-primary"
                  />
                  <label htmlFor="paybill_sandbox" className="text-sm cursor-pointer">
                    Sandbox Mode (Testing)
                  </label>
                </div>
                <div>
                  <label className={labelClass}>API Key</label>
                  <input
                    className={inputClass}
                    placeholder="PayBill API Key"
                    value={settings.paybill_api_key ?? ""}
                    onChange={(e) =>
                      handleChange("paybill_api_key", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Secret Key</label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    value={settings.paybill_secret ?? ""}
                    onChange={(e) =>
                      handleChange("paybill_secret", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Merchant ID</label>
                  <input
                    className={inputClass}
                    placeholder="PayBill Merchant ID"
                    value={settings.paybill_merchant_id ?? ""}
                    onChange={(e) =>
                      handleChange("paybill_merchant_id", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Callback URL</label>
                  <input
                    className={inputClass}
                    placeholder="https://yourdomain.com/api/paybill/callback"
                    value={settings.paybill_callback_url ?? ""}
                    onChange={(e) =>
                      handleChange("paybill_callback_url", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* PayBill info banner */}
              <div className="mt-5 p-4 bg-surface-container rounded-xl border border-border-muted">
                <div className="flex items-start gap-3">
                  <Zap size={16} className="text-status-optimal mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium mb-1">
                      PayBill Integration Status
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      PayBill payments are accepted via the billing page when
                      recording payments. Configure your API credentials above to
                      enable the PayBill gateway option for customers.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {settings.paybill_api_key ? (
                        <span className="flex items-center gap-1.5 text-xs text-status-optimal font-mono font-bold">
                          <CheckCircle size={12} /> API KEY CONFIGURED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-status-outage font-mono font-bold">
                          <XCircle size={12} /> API KEY NOT SET
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <SaveButton
                keys={[
                  "paybill_sandbox",
                  "paybill_api_key",
                  "paybill_secret",
                  "paybill_merchant_id",
                  "paybill_callback_url",
                ]}
                sectionId="paybill"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
