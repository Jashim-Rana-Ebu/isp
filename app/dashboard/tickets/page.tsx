"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Search, Plus, Eye, MoreVertical } from "lucide-react";

const PAGE_SIZE = 20;

export default function TicketsPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("tickets")
      .select("*, customer:customers(name, client_id), assigned:profiles(full_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search) query = query.or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%`);

    const { data, count } = await query;
    setTickets(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const priorityColors: Record<string, string> = {
    urgent: "text-status-outage bg-status-outage/10",
    high: "text-tertiary bg-tertiary/10",
    medium: "text-status-latency bg-status-latency/10",
    low: "text-on-surface-variant bg-on-surface-variant/10",
  };

  const statusColors: Record<string, string> = {
    open: "text-status-latency bg-status-latency/10",
    in_progress: "text-tertiary bg-tertiary/10",
    resolved: "text-status-optimal bg-status-optimal/10",
    closed: "text-on-surface-variant bg-on-surface-variant/10",
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MessageSquare size={28} className="text-primary" /> Support Tickets
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage customer issues and requests</p>
        </div>
      </div>

      <div className="bg-surface-card border border-border-muted rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input type="text" placeholder="Search subject or ticket number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="form-input-dark pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="form-input-dark text-sm w-auto min-w-[140px]">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-muted">
                {["TICKET #", "SUBJECT", "CUSTOMER", "CATEGORY", "PRIORITY", "STATUS", "ASSIGNED", "DATE", "ACTION"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-on-surface-variant font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-on-surface-variant"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" /> Loading...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-on-surface-variant">No tickets found.</td></tr>
              ) : tickets.map((t, i) => (
                <tr key={t.id} className={`border-b border-border-muted/50 hover:bg-surface-container/50 transition-colors ${i % 2 !== 0 ? "bg-[#1A1A24]/30" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{t.ticket_number}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{t.subject}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{t.customer?.name ?? "—"}</div>
                    <div className="font-mono text-[10px] text-on-surface-variant">{t.customer?.client_id}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{t.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest ${priorityColors[t.priority] ?? ""}`}>{t.priority?.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest ${statusColors[t.status] ?? ""}`}>{t.status?.toUpperCase().replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{t.assigned?.full_name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-on-surface-variant">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/tickets/${t.id}`} className="p-1.5 bg-surface-container hover:bg-primary-container/20 hover:text-primary rounded inline-flex transition-colors">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
