"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Save,
  CreditCard,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const PAGE_SIZE = 20;

type Invoice = {
  id: string;
  invoice_number: string;
  period_month: number;
  period_year: number;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: "unpaid" | "paid" | "overdue" | "cancelled" | "partial";
  due_date: string | null;
  paid_date: string | null;
  customer: { name: string; client_id: string; phone: string | null } | null;
};

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({
  invoice,
  onClose,
  onSuccess,
}: {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    amount: Number(invoice.total_amount),
    gateway: "cash",
    gateway_transaction_id: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const now = new Date().toISOString();

      // Insert payment record
      const { error: payErr } = await supabase.from("payments").insert({
        invoice_id: invoice.id,
        customer_id: (invoice.customer as { id?: string } | null)?.id ?? null,
        amount: form.amount,
        gateway: form.gateway,
        gateway_transaction_id: form.gateway_transaction_id || null,
        notes: form.notes || null,
        status: "completed",
        paid_at: now,
      });

      if (payErr) throw payErr;

      // Mark invoice as paid
      await supabase
        .from("invoices")
        .update({ status: "paid", paid_date: now })
        .eq("id", invoice.id);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-muted rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-muted">
          <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
            <CreditCard size={18} className="text-status-optimal" />
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:text-on-surface-variant"
          >
            <X size={18} />
          </button>
        </div>

        {/* Invoice Info */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-surface-container rounded-xl p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-xs text-on-surface-variant">
                  {invoice.invoice_number}
                </div>
                <div className="font-semibold mt-0.5">
                  {invoice.customer?.name}
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant">
                  {invoice.customer?.client_id} • {invoice.customer?.phone ?? ""}
                </div>
                <div className="font-mono text-xs text-on-surface-variant mt-1">
                  Period:{" "}
                  {String(invoice.period_month).padStart(2, "0")}/
                  {invoice.period_year}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-on-surface-variant">TOTAL DUE</div>
                <div className="font-mono text-xl font-bold text-status-latency">
                  ৳{Number(invoice.total_amount).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Amount Received (৳) *
            </label>
            <input
              type="number"
              required
              min={1}
              step="0.01"
              className="form-input-dark text-sm w-full"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Payment Gateway *
            </label>
            <select
              required
              className="form-input-dark text-sm w-full"
              value={form.gateway}
              onChange={(e) => setForm({ ...form, gateway: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="bkash">bKash</option>
              <option value="paybill">PayBill</option>
              <option value="sslcommerz">SSLCommerz</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.gateway !== "cash" && (
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Transaction ID
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="e.g. TXN123456"
                value={form.gateway_transaction_id}
                onChange={(e) =>
                  setForm({ ...form, gateway_transaction_id: e.target.value })
                }
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Notes (Optional)
            </label>
            <input
              className="form-input-dark text-sm w-full"
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-status-outage/10 text-status-outage text-sm">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm py-2.5 flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm py-2.5 flex-1 disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [markingOverdue, setMarkingOverdue] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("invoices")
      .select("*, customer:customers(id, name, client_id, phone)", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search)
      query = query.or(`invoice_number.ilike.%${search}%`);
    if (monthFilter) {
      const [year, month] = monthFilter.split("-");
      query = query
        .eq("period_year", Number(year))
        .eq("period_month", Number(month));
    }

    const { data, count } = await query;
    setInvoices((data ?? []) as Invoice[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, statusFilter, search, monthFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const generateMonthlyInvoices = async () => {
    setGenerating(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data: customers } = await supabase
        .from("customers")
        .select("*, package:packages(*)")
        .eq("status", "active")
        .not("package_id", "is", null);

      if (!customers?.length) {
        alert("No active customers with packages found.");
        return;
      }

      const { data: existing } = await supabase
        .from("invoices")
        .select("customer_id")
        .eq("period_month", month)
        .eq("period_year", year);

      const existingIds = new Set(
        (existing ?? []).map((e: { customer_id: string }) => e.customer_id)
      );
      const toCreate = customers.filter(
        (c: { id: string }) => !existingIds.has(c.id)
      );

      if (!toCreate.length) {
        alert("All invoices for this month already exist.");
        return;
      }

      const invoicePayloads = toCreate.map(
        (c: {
          id: string;
          package_id: string;
          package: {
            price: number;
            use_ppn: boolean;
            ppn_percentage: number;
            use_uso: boolean;
            uso_percentage: number;
          };
        }) => {
          const pkg = c.package;
          const price = Number(pkg?.price) || 0;
          let taxAmount = 0;
          if (pkg?.use_ppn)
            taxAmount += Math.round(
              price * ((Number(pkg.ppn_percentage) || 11) / 100)
            );
          if (pkg?.use_uso)
            taxAmount += Math.round(
              price * ((Number(pkg.uso_percentage) || 1.5) / 100)
            );

          return {
            customer_id: c.id,
            package_id: c.package_id,
            period_month: month,
            period_year: year,
            amount: price,
            tax_amount: taxAmount,
            total_amount: price + taxAmount,
            status: "unpaid",
            due_date: new Date(year, month - 1, 20)
              .toISOString()
              .split("T")[0],
          };
        }
      );

      const { error } = await supabase
        .from("invoices")
        .insert(invoicePayloads);
      if (error) throw error;

      alert(
        `✅ Generated ${invoicePayloads.length} invoices for ${month}/${year}`
      );
      fetchInvoices();
    } catch (err: unknown) {
      alert(
        "Error: " +
          (err instanceof Error ? err.message : "Failed to generate")
      );
    } finally {
      setGenerating(false);
    }
  };

  const markOverdue = async () => {
    setMarkingOverdue(true);
    const today = new Date().toISOString().split("T")[0];
    // Get count of affected invoices first
    const { count } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("status", "unpaid")
      .lt("due_date", today);

    await supabase
      .from("invoices")
      .update({ status: "overdue" })
      .eq("status", "unpaid")
      .lt("due_date", today);

    alert(`Marked ${count ?? 0} invoices as overdue.`);
    setMarkingOverdue(false);
    fetchInvoices();
  };

  const statusColors: Record<string, string> = {
    unpaid: "text-status-latency bg-status-latency/10",
    paid: "text-status-optimal bg-status-optimal/10",
    overdue: "text-status-outage bg-status-outage/10",
    cancelled: "text-on-surface-variant bg-on-surface-variant/10",
    partial: "text-tertiary bg-tertiary/10",
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Summary stats
  const unpaidTotal = invoices
    .filter((i) => i.status === "unpaid")
    .reduce((s, i) => s + Number(i.total_amount), 0);
  const overdueTotal = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + Number(i.total_amount), 0);
  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total_amount), 0);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText size={28} className="text-primary" /> Billing &amp; Invoices
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Generate and manage monthly invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markOverdue}
            disabled={markingOverdue}
            className="btn-secondary text-sm py-2 px-3 disabled:opacity-60"
            title="Mark all past-due unpaid invoices as overdue"
          >
            <AlertTriangle size={14} />
            {markingOverdue ? "Marking..." : "Mark Overdue"}
          </button>
          <button
            onClick={generateMonthlyInvoices}
            disabled={generating}
            className="btn-primary text-sm disabled:opacity-60"
          >
            <Plus size={16} />{" "}
            {generating ? "Generating..." : "Generate Monthly"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "UNPAID", value: `৳${unpaidTotal.toLocaleString()}`, color: "text-status-latency" },
          { label: "OVERDUE", value: `৳${overdueTotal.toLocaleString()}`, color: "text-status-outage" },
          { label: "COLLECTED (PAGE)", value: `৳${paidTotal.toLocaleString()}`, color: "text-status-optimal" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-card border border-border-muted rounded-xl p-4">
            <div className="font-mono text-[9px] tracking-widest text-on-surface-variant font-bold mb-1">
              {label}
            </div>
            <div className={`font-mono text-lg font-bold ${color}`}>{value}</div>
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
            placeholder="Search invoice number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="form-input-dark pl-9 text-sm w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="form-input-dark text-sm w-auto min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="relative">
          <Calendar
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setPage(0);
            }}
            className="form-input-dark pl-9 text-sm w-auto min-w-[160px]"
          />
        </div>
        <span className="font-mono text-xs text-on-surface-variant flex items-center">
          {total} invoices
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-muted">
                {[
                  "INVOICE #",
                  "CUSTOMER",
                  "PERIOD",
                  "AMOUNT",
                  "TAX",
                  "TOTAL",
                  "DUE DATE",
                  "STATUS",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-on-surface-variant font-bold"
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
                    colSpan={9}
                    className="px-4 py-12 text-center text-on-surface-variant"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-on-surface-variant"
                  >
                    No invoices found. Click &quot;Generate Monthly&quot; to create
                    them.
                  </td>
                </tr>
              ) : (
                invoices.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`border-b border-border-muted/50 hover:bg-surface-container/50 transition-colors ${
                      i % 2 !== 0 ? "bg-[#1A1A24]/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">
                        {inv.customer?.name ?? "—"}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant">
                        {inv.customer?.client_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {String(inv.period_month).padStart(2, "0")}/
                      {inv.period_year}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      ৳{Number(inv.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                      ৳{Number(inv.tax_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold">
                      ৳{Number(inv.total_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                      {inv.due_date ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest ${
                          statusColors[inv.status] ?? ""
                        }`}
                      >
                        {inv.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(inv.status === "unpaid" || inv.status === "overdue") && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-status-optimal/10 text-status-optimal hover:bg-status-optimal/20 transition-colors"
                          title="Record Payment"
                        >
                          <CheckCircle size={12} /> Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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
                onClick={() =>
                  setPage(Math.min(totalPages - 1, page + 1))
                }
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-border-muted disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <RecordPaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  );
}
