"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
} from "lucide-react";

const PAGE_SIZE = 20;

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-status-optimal/10", text: "text-status-optimal" },
  suspended: { bg: "bg-status-outage/10", text: "text-status-outage" },
  isolated: { bg: "bg-tertiary/10", text: "text-tertiary" },
  pending: { bg: "bg-status-latency/10", text: "text-status-latency" },
  terminated: { bg: "bg-on-surface-variant/10", text: "text-on-surface-variant" },
};

export default function CustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("customers")
      .select("*, package:packages(name), zone:zones(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,client_id.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, count } = await query;
    setCustomers(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("customers").update({ status }).eq("id", id);
    setActionMenu(null);
    fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    setActionMenu(null);
    fetchCustomers();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users size={28} className="text-primary" />
            Customers
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage your ISP client base
          </p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Customer
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-card border border-border-muted rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search by name, client ID, phone, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="form-input-dark pl-9 text-sm"
          />
        </div>
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-on-surface-variant" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="form-input-dark text-sm w-auto min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="isolated">Isolated</option>
            <option value="pending">Pending</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        {/* Count */}
        <div className="flex items-center">
          <span className="font-mono text-xs text-on-surface-variant">
            {total} total
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-muted">
                {["CLIENT ID", "NAME", "PHONE", "PACKAGE", "ZONE", "STATUS", "ACTIONS"].map(
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
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-on-surface-variant">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-on-surface-variant"
                  >
                    No customers found.{" "}
                    <Link
                      href="/dashboard/customers/new"
                      className="text-primary hover:underline"
                    >
                      Add your first customer →
                    </Link>
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => {
                  const st = statusColors[c.status] ?? statusColors.pending;
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-border-muted/50 hover:bg-surface-container/50 transition-colors ${
                        i % 2 !== 0 ? "bg-[#1A1A24]/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-primary">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="hover:underline"
                        >
                          {c.client_id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                        {c.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                        {c.package?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                        {c.zone?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest ${st.bg} ${st.text}`}
                        >
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() =>
                            setActionMenu(actionMenu === c.id ? null : c.id)
                          }
                          className="p-1 rounded hover:bg-surface-container transition-colors"
                        >
                          <MoreVertical
                            size={16}
                            className="text-on-surface-variant"
                          />
                        </button>
                        {actionMenu === c.id && (
                          <div className="absolute right-4 top-full mt-1 bg-surface-container-high border border-border-muted rounded-lg shadow-xl z-10 py-1 min-w-[160px]">
                            <Link
                              href={`/dashboard/customers/${c.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container transition-colors"
                            >
                              <Eye size={14} /> View Details
                            </Link>
                            <Link
                              href={`/dashboard/customers/${c.id}?edit=true`}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container transition-colors"
                            >
                              <Edit size={14} /> Edit
                            </Link>
                            {c.status === "active" ? (
                              <button
                                onClick={() => updateStatus(c.id, "suspended")}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container transition-colors w-full text-left text-status-outage"
                              >
                                <UserX size={14} /> Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => updateStatus(c.id, "active")}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container transition-colors w-full text-left text-status-optimal"
                              >
                                <UserCheck size={14} /> Activate
                              </button>
                            )}
                            <div className="border-t border-border-muted my-1" />
                            <button
                              onClick={() => deleteCustomer(c.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container transition-colors w-full text-left text-status-outage"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-muted">
            <span className="font-mono text-xs text-on-surface-variant">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-border-muted hover:bg-surface-variant disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  setPage(Math.min(totalPages - 1, page + 1))
                }
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-surface-container border border-border-muted hover:bg-surface-variant disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
