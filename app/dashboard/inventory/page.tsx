"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Package,
} from "lucide-react";

const PAGE_SIZE = 20;

type InventoryItem = {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit_price: number;
  serial_number: string | null;
  location: string | null;
  status: "available" | "in_use" | "damaged" | "retired";
  notes: string | null;
  created_at: string;
};

const CATEGORIES = [
  "ONU/ONT",
  "Router",
  "Switch",
  "Cable",
  "Splitter",
  "Patch Panel",
  "Fiber",
  "Power Supply",
  "Tools",
  "Other",
];

const STATUSES = [
  { value: "available", label: "Available", color: "text-status-optimal bg-status-optimal/10" },
  { value: "in_use", label: "In Use", color: "text-primary bg-primary/10" },
  { value: "damaged", label: "Damaged", color: "text-status-outage bg-status-outage/10" },
  { value: "retired", label: "Retired", color: "text-on-surface-variant bg-on-surface-variant/10" },
];

function InventoryModal({
  item,
  onClose,
  onSave,
}: {
  item?: InventoryItem | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: item?.name ?? "",
    category: item?.category ?? "ONU/ONT",
    quantity: item?.quantity ?? 1,
    unit_price: item?.unit_price ?? 0,
    serial_number: item?.serial_number ?? "",
    location: item?.location ?? "",
    status: item?.status ?? "available",
    notes: item?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      unit_price: Number(form.unit_price),
    };
    if (item?.id) {
      await supabase.from("inventory").update(payload).eq("id", item.id);
    } else {
      await supabase.from("inventory").insert(payload);
    }
    setSaving(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-muted rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-muted">
          <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
            <Box size={18} className="text-primary" />
            {item ? "Edit Item" : "Add Inventory Item"}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-on-surface-variant">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Item Name *
              </label>
              <input
                required
                className="form-input-dark text-sm w-full"
                placeholder="e.g. Hioso ONU HA-808GW"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Category
              </label>
              <select
                className="form-input-dark text-sm w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Status
              </label>
              <select
                className="form-input-dark text-sm w-full"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as InventoryItem["status"] })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={0}
                className="form-input-dark text-sm w-full"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Unit Price (৳)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="form-input-dark text-sm w-full"
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Serial Number
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="Optional"
                value={form.serial_number}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Location
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="e.g. Warehouse A"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                className="form-input-dark text-sm w-full resize-none"
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm py-2.5 w-full disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Saving..." : item ? "Update Item" : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const supabase = createClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("inventory")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search)
      query = query.or(`name.ilike.%${search}%,serial_number.ilike.%${search}%`);
    if (categoryFilter !== "all") query = query.eq("category", categoryFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data, count } = await query;
    setItems(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("inventory").delete().eq("id", id);
    fetchItems();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unit_price),
    0
  );

  const statusConfig = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Box size={28} className="text-primary" /> Inventory
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Track equipment, devices &amp; ISP assets
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "TOTAL ITEMS",
            value: String(total),
            color: "text-primary",
          },
          {
            label: "AVAILABLE",
            value: String(items.filter((i) => i.status === "available").reduce((s, i) => s + i.quantity, 0)),
            color: "text-status-optimal",
          },
          {
            label: "IN USE",
            value: String(items.filter((i) => i.status === "in_use").reduce((s, i) => s + i.quantity, 0)),
            color: "text-tertiary",
          },
          {
            label: "TOTAL VALUE",
            value: `৳${totalValue.toLocaleString()}`,
            color: "text-status-latency",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-surface-card border border-border-muted rounded-xl p-4"
          >
            <div className="font-mono text-[9px] tracking-widest text-on-surface-variant font-bold mb-2">
              {label}
            </div>
            <div className={`font-mono text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-card border border-border-muted rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search item name or serial..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="form-input-dark pl-9 text-sm w-full"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          className="form-input-dark text-sm w-auto min-w-[140px]"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="form-input-dark text-sm w-auto min-w-[140px]"
        >
          <option value="all">All Status</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-on-surface-variant flex items-center">
          {total} items
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-muted">
                {["NAME", "CATEGORY", "QTY", "UNIT PRICE", "TOTAL", "LOCATION", "STATUS", "ACTIONS"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-on-surface-variant font-bold"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading inventory...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Package size={36} className="text-border-muted mx-auto mb-3" />
                    <p className="text-on-surface-variant">
                      No inventory items. Click &quot;Add Item&quot; to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const statusCfg = statusConfig[item.status];
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-border-muted/50 hover:bg-surface-container/40 transition-colors ${
                        i % 2 !== 0 ? "bg-[#1A1A24]/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        {item.serial_number && (
                          <div className="font-mono text-[10px] text-on-surface-variant">
                            SN: {item.serial_number}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                        {item.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold">
                        <span
                          className={item.quantity === 0 ? "text-status-outage" : ""}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        ৳{Number(item.unit_price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold">
                        ৳{(item.quantity * Number(item.unit_price)).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                        {item.location ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            statusCfg?.color ?? ""
                          }`}
                        >
                          {statusCfg?.label ?? item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-status-outage/10 text-on-surface-variant hover:text-status-outage transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-muted">
            <span className="font-mono text-xs text-on-surface-variant">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-border-muted disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-border-muted disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <InventoryModal
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={fetchItems}
        />
      )}
    </div>
  );
}
