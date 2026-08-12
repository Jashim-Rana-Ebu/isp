import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  BarChart2,
  Wifi,
  AlertTriangle,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch dashboard stats
  const { data: statsData } = await supabase.rpc("get_dashboard_stats");
  const stats = statsData ?? {
    total_customers: 0,
    active_customers: 0,
    suspended_customers: 0,
    pending_customers: 0,
    total_revenue_this_month: 0,
    unpaid_invoices: 0,
    unpaid_amount: 0,
    overdue_invoices: 0,
    open_tickets: 0,
    new_customers_this_month: 0,
  };

  // Recent customers
  const { data: recentCustomers } = await supabase
    .from("customers")
    .select("*, package:packages(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select("*, customer:customers(name, client_id)")
    .eq("status", "completed")
    .order("paid_at", { ascending: false })
    .limit(5);

  // Recent tickets
  const { data: recentTickets } = await supabase
    .from("tickets")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const statCards = [
    {
      label: "ACTIVE CLIENTS",
      value: stats.active_customers?.toLocaleString() ?? "0",
      change: `${stats.new_customers_this_month ?? 0} new this month`,
      color: "text-status-optimal",
      icon: Users,
    },
    {
      label: "MONTHLY REVENUE",
      value: `৳${(stats.total_revenue_this_month ?? 0).toLocaleString()}`,
      change: "This month",
      color: "text-primary",
      icon: BarChart2,
    },
    {
      label: "UNPAID INVOICES",
      value: String(stats.unpaid_invoices ?? 0),
      change: `৳${(stats.unpaid_amount ?? 0).toLocaleString()} pending`,
      color: "text-status-latency",
      icon: FileText,
    },
    {
      label: "OPEN TICKETS",
      value: String(stats.open_tickets ?? 0),
      change: "Needs attention",
      color: "text-tertiary",
      icon: AlertTriangle,
    },
    {
      label: "TOTAL CLIENTS",
      value: stats.total_customers?.toLocaleString() ?? "0",
      change: `${stats.suspended_customers ?? 0} suspended`,
      color: "text-primary-fixed",
      icon: TrendingUp,
    },
    {
      label: "OVERDUE",
      value: String(stats.overdue_invoices ?? 0),
      change: "Past due date",
      color: "text-status-outage",
      icon: FileText,
    },
  ];

  const statusColors: Record<string, string> = {
    active: "text-status-optimal",
    suspended: "text-status-outage",
    pending: "text-status-latency",
    isolated: "text-tertiary",
    terminated: "text-on-surface-variant",
  };

  return (
    <div className="p-6 md:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold">
            Command Center
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 font-mono">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-container border border-border-muted rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-status-optimal status-pulse" />
            <span className="font-mono text-xs text-on-surface-variant">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {statCards.map(({ label, value, change, color, icon: Icon }) => (
          <div
            key={label}
            className="bg-surface-card border border-border-muted rounded-xl p-4 hover:border-outline-variant transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[9px] tracking-widest text-on-surface-variant font-bold">
                {label}
              </span>
              <Icon size={14} className={color} />
            </div>
            <div
              className={`font-mono text-lg md:text-xl font-bold ${color} mb-1`}
            >
              {value}
            </div>
            <div className="font-mono text-[10px] text-on-surface-variant">
              {change}
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Clients Table */}
        <div className="xl:col-span-2 bg-surface-card border border-border-muted rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-muted">
            <h2 className="font-grotesk font-semibold">Recent Clients</h2>
            <Link
              href="/dashboard/customers"
              className="text-xs text-primary hover:text-primary-fixed transition-colors font-mono"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-muted">
                  {["CLIENT ID", "NAME", "PACKAGE", "STATUS"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-mono text-[10px] tracking-widest text-on-surface-variant font-bold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentCustomers ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-on-surface-variant text-sm"
                    >
                      No customers yet.{" "}
                      <Link
                        href="/dashboard/customers/new"
                        className="text-primary hover:underline"
                      >
                        Add your first customer →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  (recentCustomers ?? []).map((c, i) => (
                    <tr
                      key={c.id}
                      className={`border-b border-border-muted/50 hover:bg-surface-container/50 transition-colors ${
                        i % 2 === 0 ? "" : "bg-[#1A1A24]/30"
                      }`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-primary">
                        <Link href={`/dashboard/customers/${c.id}`} className="hover:underline">
                          {c.client_id}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">
                        {c.name}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-on-surface-variant">
                        {(c.package as { name: string } | null)?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-mono text-[10px] font-bold tracking-widest ${
                            statusColors[c.status] ?? "text-on-surface-variant"
                          }`}
                        >
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Recent Payments */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-grotesk font-semibold text-sm">
                Recent Payments
              </h3>
              <Link
                href="/dashboard/payments"
                className="font-mono text-[10px] text-primary tracking-widest hover:underline"
              >
                VIEW ALL
              </Link>
            </div>
            <div className="space-y-3">
              {(recentPayments ?? []).length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-4">
                  No payments recorded yet
                </p>
              ) : (
                (recentPayments ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {(p.customer as { name: string; client_id: string } | null)?.name ?? "Unknown"}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant">
                        {(p.customer as { client_id: string } | null)?.client_id ?? ""} •{" "}
                        {p.gateway?.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight size={12} className="text-status-optimal" />
                      <span className="font-mono text-sm font-bold text-status-optimal">
                        ৳{Number(p.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-grotesk font-semibold text-sm">
                Open Tickets
              </h3>
              <Link
                href="/dashboard/tickets"
                className="font-mono text-[10px] text-primary tracking-widest hover:underline"
              >
                VIEW ALL
              </Link>
            </div>
            <div className="space-y-3">
              {(recentTickets ?? []).length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-4">
                  No open tickets
                </p>
              ) : (
                (recentTickets ?? []).map((t) => {
                  const priorityColors: Record<string, string> = {
                    urgent: "bg-status-outage",
                    high: "bg-tertiary",
                    medium: "bg-status-latency",
                    low: "bg-on-surface-variant",
                  };
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            priorityColors[t.priority] ?? "bg-on-surface-variant"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium truncate max-w-[180px]">
                            {t.subject}
                          </div>
                          <div className="font-mono text-[10px] text-on-surface-variant">
                            {(t.customer as { name: string } | null)?.name ?? ""}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold tracking-widest text-on-surface-variant">
                        {t.status?.toUpperCase().replace("_", " ")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
