"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  Zap,
} from "lucide-react";

export default function PackagesPage() {
  const supabase = createClient();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", bandwidth_up: "", bandwidth_down: "",
    promo_price: "", promo_cycles: "0", prorate_first_invoice: false,
    use_ppn: false, ppn_percentage: "11", use_uso: false, uso_percentage: "1.5",
    is_active: true, sort_order: "0",
  });

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("packages").select("*").order("sort_order");
    setPackages(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const resetForm = () => {
    setForm({
      name: "", description: "", price: "", bandwidth_up: "", bandwidth_down: "",
      promo_price: "", promo_cycles: "0", prorate_first_invoice: false,
      use_ppn: false, ppn_percentage: "11", use_uso: false, uso_percentage: "1.5",
      is_active: true, sort_order: "0",
    });
    setEditId(null);
    setShowForm(false);
    setFormError(null);
  };

  const startEdit = (pkg: any) => {
    setForm({
      name: pkg.name, description: pkg.description ?? "",
      price: String(pkg.price), bandwidth_up: pkg.bandwidth_up ?? "",
      bandwidth_down: pkg.bandwidth_down ?? "",
      promo_price: pkg.promo_price != null ? String(pkg.promo_price) : "",
      promo_cycles: String(pkg.promo_cycles ?? 0),
      prorate_first_invoice: pkg.prorate_first_invoice ?? false,
      use_ppn: pkg.use_ppn ?? false, ppn_percentage: String(pkg.ppn_percentage ?? 11),
      use_uso: pkg.use_uso ?? false, uso_percentage: String(pkg.uso_percentage ?? 1.5),
      is_active: pkg.is_active ?? true, sort_order: String(pkg.sort_order ?? 0),
    });
    setEditId(pkg.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price) || 0,
      bandwidth_up: form.bandwidth_up || null,
      bandwidth_down: form.bandwidth_down || null,
      promo_price: form.promo_price ? Number(form.promo_price) : null,
      promo_cycles: Number(form.promo_cycles) || 0,
      prorate_first_invoice: form.prorate_first_invoice,
      use_ppn: form.use_ppn,
      ppn_percentage: Number(form.ppn_percentage) || 11,
      use_uso: form.use_uso,
      uso_percentage: Number(form.uso_percentage) || 1.5,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };

    const { error } = editId
      ? await supabase.from("packages").update(payload).eq("id", editId)
      : await supabase.from("packages").insert(payload);

    if (error) { setFormError(error.message); return; }
    resetForm();
    fetchPackages();
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    await supabase.from("packages").delete().eq("id", id);
    fetchPackages();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("packages").update({ is_active: !current }).eq("id", id);
    fetchPackages();
  };

  const inputClass = "form-input-dark text-sm";
  const labelClass = "block text-sm font-medium text-on-surface-variant mb-1";

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Package size={28} className="text-primary" />
            Internet Packages
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage your service plans and pricing</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
          <Plus size={16} /> Add Package
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className="bg-surface-card border border-border-muted rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-grotesk text-xl font-bold">{editId ? "Edit" : "New"} Package</h2>
              <button onClick={resetForm} className="p-1 hover:bg-surface-container rounded-lg"><X size={20} /></button>
            </div>
            {formError && <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/40 text-error text-sm">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Package Name *</label><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Business 50Mbps" /></div>
                <div><label className={labelClass}>Monthly Price (৳) *</label><input required type="number" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1500" /></div>
                <div><label className={labelClass}>Upload Speed</label><input className={inputClass} value={form.bandwidth_up} onChange={(e) => setForm({ ...form, bandwidth_up: e.target.value })} placeholder="25M" /></div>
                <div><label className={labelClass}>Download Speed</label><input className={inputClass} value={form.bandwidth_down} onChange={(e) => setForm({ ...form, bandwidth_down: e.target.value })} placeholder="50M" /></div>
                <div><label className={labelClass}>Promo Price (৳)</label><input type="number" className={inputClass} value={form.promo_price} onChange={(e) => setForm({ ...form, promo_price: e.target.value })} placeholder="Optional" /></div>
                <div><label className={labelClass}>Promo Cycles</label><input type="number" className={inputClass} value={form.promo_cycles} onChange={(e) => setForm({ ...form, promo_cycles: e.target.value })} /></div>
                <div><label className={labelClass}>Sort Order</label><input type="number" className={inputClass} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
              </div>
              <div><label className={labelClass}>Description</label><textarea rows={2} className={inputClass + " resize-none"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Package description..." /></div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.prorate_first_invoice} onChange={(e) => setForm({ ...form, prorate_first_invoice: e.target.checked })} className="accent-primary-container" /> Prorate first invoice</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.use_ppn} onChange={(e) => setForm({ ...form, use_ppn: e.target.checked })} className="accent-primary-container" /> Apply PPN Tax ({form.ppn_percentage}%)</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.use_uso} onChange={(e) => setForm({ ...form, use_uso: e.target.checked })} className="accent-primary-container" /> Apply USO ({form.uso_percentage}%)</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary-container" /> Active</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border-muted">
                <button type="submit" className="btn-primary text-sm"><Save size={16} /> {editId ? "Update" : "Create"} Package</button>
                <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12 text-on-surface-variant">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" /> Loading...
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-on-surface-variant">No packages yet. Click "Add Package" to create one.</div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className={`bg-surface-card border rounded-2xl p-6 transition-all ${pkg.is_active ? "border-border-muted hover:border-outline-variant" : "border-border-muted opacity-60"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-mono text-[10px] tracking-widest font-bold ${pkg.is_active ? "text-primary" : "text-on-surface-variant"}`}>
                  {pkg.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(pkg.id, pkg.is_active)} className="p-1 hover:bg-surface-container rounded" title={pkg.is_active ? "Deactivate" : "Activate"}>
                    {pkg.is_active ? <ToggleRight size={18} className="text-status-optimal" /> : <ToggleLeft size={18} className="text-on-surface-variant" />}
                  </button>
                  <button onClick={() => startEdit(pkg)} className="p-1 hover:bg-surface-container rounded"><Edit size={14} className="text-on-surface-variant" /></button>
                  <button onClick={() => deletePackage(pkg.id)} className="p-1 hover:bg-surface-container rounded"><Trash2 size={14} className="text-status-outage" /></button>
                </div>
              </div>
              <h3 className="font-grotesk text-lg font-semibold mb-2">{pkg.name}</h3>
              <div className="mb-3">
                <span className="text-xl align-top text-on-surface">৳</span>
                <span className="font-grotesk text-3xl font-bold">{Number(pkg.price).toLocaleString()}</span>
                <span className="text-on-surface-variant text-sm">/month</span>
              </div>
              {pkg.description && <p className="text-on-surface-variant text-sm mb-3">{pkg.description}</p>}
              <div className="space-y-1 text-sm font-mono">
                {pkg.bandwidth_down && <div className="text-on-surface-variant">↓ {pkg.bandwidth_down} / ↑ {pkg.bandwidth_up ?? "—"}</div>}
                {pkg.promo_price != null && <div className="text-primary">Promo: ৳{Number(pkg.promo_price).toLocaleString()} × {pkg.promo_cycles} cycles</div>}
                {pkg.use_ppn && <div className="text-on-surface-variant">PPN: {pkg.ppn_percentage}%</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
