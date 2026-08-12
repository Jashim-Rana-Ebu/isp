"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart2,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CHART_COLORS = {
  primary: "#a78bfa",
  optimal: "#00FF41",
  latency: "#FFD300",
  outage: "#FF3131",
  tertiary: "#ffb599",
  purple: "#7c3aed",
  teal: "#06b6d4",
};

const GATEWAY_COLORS: Record<string, string> = {
  cash: CHART_COLORS.optimal,
  bkash: CHART_COLORS.primary,
  paybill: CHART_COLORS.teal,
  sslcommerz: CHART_COLORS.tertiary,
  bank_transfer: CHART_COLORS.latency,
  other: "#6b7280",
};

type MonthlyRevenue = {
  month_label: string;
  revenue: number;
  invoice_count: number;
};

type GatewayStats = {
  gateway: string;
  total_amount: number;
  transaction_count: number;
};

type DashboardStats = {
  total_customers: number;
  active_customers: number;
  suspended_customers: number;
  pending_customers: number;
  total_revenue_this_month: number;
  unpaid_invoices: number;
  unpaid_amount: number;
  overdue_invoices: number;
  open_tickets: number;
  new_customers_this_month: number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
  prefix = "৳",
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  prefix?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container border border-border-muted rounded-xl px-4 py-3 shadow-xl">
        <p className="font-mono text-xs text-on-surface-variant mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-mono text-sm font-bold" style={{ color: p.color }}>
            {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [gatewayStats, setGatewayStats] = useState<GatewayStats[]>([]);
  const [packageDist, setPackageDist] = useState<
    { name: string; value: number }[]
  >([]);
  const [customerGrowth, setCustomerGrowth] = useState<
    { month: string; total: number; active: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      // Dashboard stats
      const { data: statsData } = await supabase.rpc("get_dashboard_stats");

      // Monthly revenue (last 6 months via direct query)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      const { data: revenueData } = await supabase
        .from("payments")
        .select("amount, paid_at, gateway")
        .eq("status", "completed")
        .gte("paid_at", sixMonthsAgo.toISOString())
        .order("paid_at");

      // Process revenue by month
      const revenueByMonth: Record<
        string,
        { revenue: number; invoice_count: number }
      > = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        revenueByMonth[key] = { revenue: 0, invoice_count: 0 };
      }
      (revenueData ?? []).forEach((p: { amount: number; paid_at: string }) => {
        if (!p.paid_at) return;
        const d = new Date(p.paid_at);
        const key = d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        if (revenueByMonth[key]) {
          revenueByMonth[key].revenue += Number(p.amount);
          revenueByMonth[key].invoice_count++;
        }
      });
      const monthlyData: MonthlyRevenue[] = Object.entries(revenueByMonth).map(
        ([month_label, v]) => ({ month_label, ...v })
      );

      // Gateway breakdown
      const gatewayMap: Record<string, { total_amount: number; transaction_count: number }> = {};
      (revenueData ?? []).forEach((p: { amount: number; gateway?: string }) => {
        const gw = p.gateway ?? "other";
        if (!gatewayMap[gw])
          gatewayMap[gw] = { total_amount: 0, transaction_count: 0 };
        gatewayMap[gw].total_amount += Number(p.amount);
        gatewayMap[gw].transaction_count++;
      });
      const gwStats: GatewayStats[] = Object.entries(gatewayMap).map(
        ([gateway, v]) => ({ gateway, ...v })
      );

      // Package distribution
      const { data: pkgData } = await supabase
        .from("customers")
        .select("package:packages(name)")
        .eq("status", "active")
        .not("package_id", "is", null);

      const pkgMap: Record<string, number> = {};
      (pkgData ?? []).forEach((c: { package: { name: string }[] | null }) => {
        const pkg = Array.isArray(c.package) ? c.package[0] : c.package;
        const name = (pkg as { name?: string } | null)?.name ?? "Unknown";
        pkgMap[name] = (pkgMap[name] ?? 0) + 1;
      });
      const pkgDist = Object.entries(pkgMap).map(([name, value]) => ({
        name,
        value,
      }));

      setStats(statsData ?? null);
      setMonthlyRevenue(monthlyData);
      setGatewayStats(gwStats);
      setPackageDist(pkgDist);
    } catch {
      // ignore errors
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const collectionRate =
    stats?.total_revenue_this_month && stats?.unpaid_amount
      ? Math.round(
          (stats.total_revenue_this_month /
            (stats.total_revenue_this_month + stats.unpaid_amount)) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart2 size={28} className="text-primary" /> Reports &amp;
            Analytics
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Key performance indicators for your ISP
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="p-2 rounded-lg bg-surface-card border border-border-muted hover:bg-surface-container transition-colors"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "MONTHLY REVENUE",
            value: `৳${(stats?.total_revenue_this_month ?? 0).toLocaleString()}`,
            color: "text-status-optimal",
            icon: DollarSign,
          },
          {
            label: "ACTIVE CUSTOMERS",
            value: String(stats?.active_customers ?? 0),
            color: "text-primary",
            icon: Users,
          },
          {
            label: "COLLECTION RATE",
            value: `${collectionRate}%`,
            color:
              collectionRate >= 80
                ? "text-status-optimal"
                : collectionRate >= 60
                ? "text-status-latency"
                : "text-status-outage",
            icon: TrendingUp,
          },
          {
            label: "UNPAID AMOUNT",
            value: `৳${(stats?.unpaid_amount ?? 0).toLocaleString()}`,
            color: "text-status-latency",
            icon: BarChart2,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="bg-surface-card border border-border-muted rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-widest text-on-surface-variant font-bold">
                {label}
              </span>
              <Icon size={14} className={color} />
            </div>
            <div className={`font-mono text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        {/* Monthly Revenue Bar Chart */}
        <div className="xl:col-span-2 bg-surface-card border border-border-muted rounded-xl p-5">
          <h2 className="font-grotesk font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-status-optimal" />
            Monthly Revenue (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={monthlyRevenue}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="month_label"
                tick={{ fontSize: 10, fill: "#a1a1aa", fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#a1a1aa", fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={<CustomTooltip prefix="৳" />}
                cursor={{ fill: "rgba(167,139,250,0.05)" }}
              />
              <Bar
                dataKey="revenue"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Status Pie */}
        <div className="bg-surface-card border border-border-muted rounded-xl p-5">
          <h2 className="font-grotesk font-semibold mb-4 flex items-center gap-2">
            <Users size={16} className="text-primary" />
            Customer Status
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Active",
                    value: stats?.active_customers ?? 0,
                    color: CHART_COLORS.optimal,
                  },
                  {
                    name: "Suspended",
                    value: stats?.suspended_customers ?? 0,
                    color: CHART_COLORS.outage,
                  },
                  {
                    name: "Pending",
                    value: stats?.pending_customers ?? 0,
                    color: CHART_COLORS.latency,
                  },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {[
                  CHART_COLORS.optimal,
                  CHART_COLORS.outage,
                  CHART_COLORS.latency,
                ].map((color, index) => (
                  <Cell key={index} fill={color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {[
              {
                label: "Active",
                value: stats?.active_customers ?? 0,
                color: "bg-status-optimal",
              },
              {
                label: "Suspended",
                value: stats?.suspended_customers ?? 0,
                color: "bg-status-outage",
              },
              {
                label: "Pending",
                value: stats?.pending_customers ?? 0,
                color: "bg-status-latency",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-xs text-on-surface-variant">{label}</span>
                </div>
                <span className="font-mono text-xs font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Payment Gateway Breakdown */}
        <div className="bg-surface-card border border-border-muted rounded-xl p-5">
          <h2 className="font-grotesk font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-tertiary" />
            Payment Methods Breakdown
          </h2>
          {gatewayStats.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-on-surface-variant text-sm">
              No payment data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={gatewayStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="total_amount"
                    nameKey="gateway"
                  >
                    {gatewayStats.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={GATEWAY_COLORS[entry.gateway] ?? "#6b7280"}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: unknown) => [`৳${Number(value).toLocaleString()}`, ""] as [string, string]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {gatewayStats.map((g) => (
                  <div
                    key={g.gateway}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background:
                            GATEWAY_COLORS[g.gateway] ?? "#6b7280",
                        }}
                      />
                      <span className="text-xs text-on-surface-variant capitalize">
                        {g.gateway.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        {g.transaction_count} txns
                      </span>
                      <span className="font-mono text-xs font-bold">
                        ৳{Number(g.total_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Package Distribution */}
        <div className="bg-surface-card border border-border-muted rounded-xl p-5">
          <h2 className="font-grotesk font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Active Package Distribution
          </h2>
          {packageDist.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-on-surface-variant text-sm">
              No package data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={packageDist}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{
                    fontSize: 10,
                    fill: "#a1a1aa",
                    fontFamily: "monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: "#a1a1aa",
                    fontFamily: "monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  content={<CustomTooltip prefix="" />}
                  cursor={{ fill: "rgba(167,139,250,0.05)" }}
                />
                <Bar
                  dataKey="value"
                  fill={CHART_COLORS.primary}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                  label={{
                    position: "right",
                    fontSize: 10,
                    fill: "#a1a1aa",
                    fontFamily: "monospace",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="mt-4 bg-surface-card border border-border-muted rounded-xl p-5">
        <h2 className="font-grotesk font-semibold mb-4">
          Business Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Customers",
              value: stats?.total_customers ?? 0,
              format: "number",
            },
            {
              label: "New This Month",
              value: stats?.new_customers_this_month ?? 0,
              format: "number",
              positive: true,
            },
            {
              label: "Unpaid Invoices",
              value: stats?.unpaid_invoices ?? 0,
              format: "number",
            },
            {
              label: "Overdue Invoices",
              value: stats?.overdue_invoices ?? 0,
              format: "number",
              warn: true,
            },
            {
              label: "Revenue This Month",
              value: stats?.total_revenue_this_month ?? 0,
              format: "currency",
            },
            {
              label: "Pending Amount",
              value: stats?.unpaid_amount ?? 0,
              format: "currency",
              warn: true,
            },
            {
              label: "Open Tickets",
              value: stats?.open_tickets ?? 0,
              format: "number",
            },
            {
              label: "Collection Rate",
              value: collectionRate,
              format: "percent",
            },
          ].map(({ label, value, format, positive, warn }) => (
            <div
              key={label}
              className="border-b border-border-muted/50 pb-3 last:border-0"
            >
              <div className="text-xs text-on-surface-variant mb-1">{label}</div>
              <div
                className={`font-mono font-bold text-sm ${
                  positive
                    ? "text-status-optimal"
                    : warn
                    ? "text-status-latency"
                    : ""
                }`}
              >
                {format === "currency"
                  ? `৳${Number(value).toLocaleString()}`
                  : format === "percent"
                  ? `${value}%`
                  : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
