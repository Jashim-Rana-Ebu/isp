"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const PAGE_SIZE = 20;

export default function PaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("payments")
      .select("*, customer:customers(name, client_id), invoice:invoices(invoice_number)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (gatewayFilter !== "all") query = query.eq("gateway", gatewayFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, count } = await query;
    setPayments(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, gatewayFilter, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const statusColors: Record<string, string> = {
    completed: "text-status-optimal bg-status-optimal/10",
    pending: "text-status-latency bg-status-latency/10",
    failed: "text-status-outage bg-status-outage/10",
    refunded: "text-tertiary bg-tertiary/10",
    cancelled: "text-on-surface-variant bg-on-surface-variant/10",
  };

  const gatewayColors: Record<string, string> = {
    sslcommerz: "text-primary", bkash: "text-tertiary", paybill: "text-status-optimal",
    cash: "text-status-latency", bank_transfer: "text-primary-fixed", other: "text-on-surface-variant",
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CreditCard size={28} className="text-primary" /> Payment History
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Track all payment transactions</p>
        </div>
        <Link href="/dashboard/payments/new" className="btn-primary text-sm">
          <Plus size={16} /> Record Payment
        </Link>
      </div>

      <div className="bg-surface-card border border-border-muted rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3">
        <select value={gatewayFilter} onChange={(e) => { setGatewayFilter(e.target.value); setPage(0); }} className="form-input-dark text-sm w-auto min-w-[140px]">
          <option value="all">All Gateways</option>
          <option value="sslcommerz">SSLCommerz</option>
          <option value="bkash">bKash</option>
          <option value="paybill">PayBill</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="form-input-dark text-sm w-auto min-w-[140px]">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <span className="font-mono text-xs text-on-surface-variant flex items-center ml-auto">{total} transactions</span>
      </div>

      <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-muted">
                {["DATE", "CUSTOMER", "INVOICE", "GATEWAY", "AMOUNT", "STATUS", "TXN ID"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-on-surface-variant font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">
                  <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Loading...</div>
                </td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">No payments found.</td></tr>
              ) : payments.map((p, i) => (
                <tr key={p.id} className={`border-b border-border-muted/50 hover:bg-surface-container/50 transition-colors ${i % 2 !== 0 ? "bg-[#1A1A24]/30" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{p.customer?.name ?? "—"}</div>
                    <div className="font-mono text-[10px] text-on-surface-variant">{p.customer?.client_id}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{p.invoice?.invoice_number ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs font-bold ${gatewayColors[p.gateway] ?? ""}`}>
                      {p.gateway?.toUpperCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-bold">৳{Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest ${statusColors[p.status] ?? ""}`}>
                      {p.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-on-surface-variant truncate max-w-[120px]">{p.gateway_transaction_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-muted">
            <span className="font-mono text-xs text-on-surface-variant">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-border-muted disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-border-muted disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
