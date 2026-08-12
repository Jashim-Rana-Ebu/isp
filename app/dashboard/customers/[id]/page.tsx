import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Wifi,
  Router,
  Hash,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  Edit,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch customer with related data
  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      "*, package:packages(name, price, bandwidth_up, bandwidth_down), zone:zones(name), sub_zone:sub_zones(name)"
    )
    .eq("id", id)
    .single();

  if (error || !customer) {
    redirect("/dashboard/customers");
  }

  // Fetch invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoice:invoices(invoice_number)")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-status-optimal/10", text: "text-status-optimal" },
    suspended: { bg: "bg-status-outage/10", text: "text-status-outage" },
    isolated: { bg: "bg-tertiary/10", text: "text-tertiary" },
    pending: { bg: "bg-status-latency/10", text: "text-status-latency" },
    terminated: {
      bg: "bg-on-surface-variant/10",
      text: "text-on-surface-variant",
    },
  };

  const invoiceStatusColors: Record<string, string> = {
    unpaid: "text-status-latency bg-status-latency/10",
    paid: "text-status-optimal bg-status-optimal/10",
    overdue: "text-status-outage bg-status-outage/10",
    cancelled: "text-on-surface-variant bg-on-surface-variant/10",
    partial: "text-tertiary bg-tertiary/10",
  };

  const totalPaid =
    payments
      ?.filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const totalUnpaid =
    invoices
      ?.filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
      .reduce((sum, inv) => sum + Number(inv.total_amount), 0) ?? 0;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/customers"
          className="w-9 h-9 rounded-lg bg-surface-card border border-border-muted flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-grotesk text-2xl font-bold">{customer.name}</h1>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest ${
                statusColors[customer.status]?.bg ?? ""
              } ${statusColors[customer.status]?.text ?? ""}`}
            >
              {customer.status?.toUpperCase()}
            </span>
          </div>
          <p className="font-mono text-xs text-on-surface-variant mt-0.5">
            {customer.client_id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/customers/${id}/edit`}
            className="btn-secondary text-sm py-2 px-4"
          >
            <Edit size={14} /> Edit
          </Link>
          <form
            action={
              customer.status === "active"
                ? `/api/customers/${id}/suspend`
                : `/api/customers/${id}/activate`
            }
            method="POST"
          >
            <button
              type="submit"
              className={`flex items-center gap-2 text-sm py-2 px-4 rounded-lg font-bold border transition-colors ${
                customer.status === "active"
                  ? "border-status-outage/30 text-status-outage hover:bg-status-outage/10"
                  : "border-status-optimal/30 text-status-optimal hover:bg-status-optimal/10"
              }`}
            >
              {customer.status === "active" ? (
                <>
                  <UserX size={14} /> Suspend
                </>
              ) : (
                <>
                  <UserCheck size={14} /> Activate
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "TOTAL PAID",
            value: `৳${totalPaid.toLocaleString()}`,
            color: "text-status-optimal",
          },
          {
            label: "OUTSTANDING",
            value: `৳${totalUnpaid.toLocaleString()}`,
            color: "text-status-latency",
          },
          {
            label: "INVOICES",
            value: String(invoices?.length ?? 0),
            color: "text-primary",
          },
          {
            label: "TICKETS",
            value: String(tickets?.length ?? 0),
            color: "text-tertiary",
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Customer Info */}
        <div className="xl:col-span-1 space-y-4">
          {/* Profile Card */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <h2 className="font-grotesk font-semibold text-sm mb-4 pb-3 border-b border-border-muted flex items-center gap-2">
              <User size={15} className="text-primary" /> Customer Info
            </h2>
            <div className="space-y-3">
              {[
                {
                  icon: Hash,
                  label: "Client ID",
                  value: customer.client_id ?? "—",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: customer.phone ?? "—",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: customer.email ?? "—",
                },
                {
                  icon: MapPin,
                  label: "Address",
                  value: customer.address ?? "—",
                },
                {
                  icon: MapPin,
                  label: "Zone",
                  value:
                    (customer.zone as { name: string } | null)?.name ?? "—",
                },
                {
                  icon: Calendar,
                  label: "Install Date",
                  value: customer.install_date
                    ? new Date(customer.install_date).toLocaleDateString()
                    : "—",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon
                    size={14}
                    className="text-on-surface-variant mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-on-surface-variant">
                      {label}
                    </div>
                    <div className="text-sm font-medium truncate">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Card */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <h2 className="font-grotesk font-semibold text-sm mb-4 pb-3 border-b border-border-muted flex items-center gap-2">
              <Shield size={15} className="text-primary" /> Package
            </h2>
            {customer.package ? (
              <div className="space-y-2">
                <div className="font-semibold text-primary">
                  {(customer.package as { name: string }).name}
                </div>
                <div className="font-mono text-2xl font-bold">
                  ৳
                  {Number(
                    (customer.package as { price: number }).price
                  ).toLocaleString()}
                  <span className="text-xs font-normal text-on-surface-variant">
                    /mo
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    ↑{" "}
                    {(customer.package as { bandwidth_up: string }).bandwidth_up}
                  </span>
                  <span className="font-mono text-xs bg-status-optimal/10 text-status-optimal px-2 py-0.5 rounded-full">
                    ↓{" "}
                    {
                      (customer.package as { bandwidth_down: string })
                        .bandwidth_down
                    }
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">No package assigned</p>
            )}
          </div>

          {/* Network Card */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <h2 className="font-grotesk font-semibold text-sm mb-4 pb-3 border-b border-border-muted flex items-center gap-2">
              <Wifi size={15} className="text-primary" /> Network
            </h2>
            <div className="space-y-3">
              {[
                { label: "IP Address", value: customer.ip_address ?? "—" },
                {
                  label: "PPPoE Username",
                  value: customer.pppoe_username ?? "—",
                },
                { label: "MAC Address", value: customer.mac_address ?? "—" },
                { label: "ONU Serial", value: customer.onu_serial ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="font-mono text-[10px] text-on-surface-variant">
                    {label}
                  </div>
                  <div className="font-mono text-sm font-medium">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Invoices, Payments, Tickets */}
        <div className="xl:col-span-2 space-y-4">
          {/* Invoices */}
          <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-muted">
              <h2 className="font-grotesk font-semibold text-sm flex items-center gap-2">
                <FileText size={15} className="text-primary" /> Invoice History
              </h2>
              <Link
                href="/dashboard/billing"
                className="font-mono text-[10px] text-primary tracking-widest hover:underline"
              >
                VIEW ALL
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-muted">
                    {["INVOICE #", "PERIOD", "AMOUNT", "DUE", "STATUS"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left font-mono text-[9px] tracking-widest text-on-surface-variant font-bold"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(invoices ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-on-surface-variant text-sm"
                      >
                        No invoices yet
                      </td>
                    </tr>
                  ) : (
                    invoices!.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-border-muted/50 hover:bg-surface-container/40 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs text-primary">
                          {inv.invoice_number}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs">
                          {String(inv.period_month).padStart(2, "0")}/
                          {inv.period_year}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs font-bold">
                          ৳{Number(inv.total_amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-on-surface-variant">
                          {inv.due_date ?? "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-widest ${
                              invoiceStatusColors[inv.status] ?? ""
                            }`}
                          >
                            {inv.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-surface-card border border-border-muted rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-muted">
              <h2 className="font-grotesk font-semibold text-sm flex items-center gap-2">
                <CreditCard size={15} className="text-primary" /> Payment
                History
              </h2>
              <Link
                href="/dashboard/payments"
                className="font-mono text-[10px] text-primary tracking-widest hover:underline"
              >
                VIEW ALL
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-muted">
                    {["DATE", "INVOICE", "GATEWAY", "AMOUNT", "STATUS"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left font-mono text-[9px] tracking-widest text-on-surface-variant font-bold"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(payments ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-on-surface-variant text-sm"
                      >
                        No payments yet
                      </td>
                    </tr>
                  ) : (
                    payments!.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border-muted/50 hover:bg-surface-container/40 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-mono text-[10px] text-on-surface-variant">
                          {p.paid_at
                            ? new Date(p.paid_at).toLocaleDateString()
                            : new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-primary">
                          {(p.invoice as { invoice_number: string } | null)
                            ?.invoice_number ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs font-bold text-on-surface-variant">
                          {p.gateway?.toUpperCase().replace("_", " ")}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-sm font-bold text-status-optimal">
                          ৳{Number(p.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-widest ${
                              p.status === "completed"
                                ? "text-status-optimal bg-status-optimal/10"
                                : "text-status-latency bg-status-latency/10"
                            }`}
                          >
                            {p.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-grotesk font-semibold text-sm flex items-center gap-2">
                <MessageSquare size={15} className="text-primary" /> Support
                Tickets
              </h2>
              <Link
                href="/dashboard/tickets"
                className="font-mono text-[10px] text-primary tracking-widest hover:underline"
              >
                VIEW ALL
              </Link>
            </div>
            {(tickets ?? []).length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-4">
                No tickets
              </p>
            ) : (
              <div className="space-y-3">
                {tickets!.map((t) => {
                  const priorityColors: Record<string, string> = {
                    urgent: "bg-status-outage",
                    high: "bg-tertiary",
                    medium: "bg-status-latency",
                    low: "bg-on-surface-variant",
                  };
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 border-b border-border-muted/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            priorityColors[t.priority] ?? "bg-on-surface-variant"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {t.subject}
                          </div>
                          <div className="font-mono text-[10px] text-on-surface-variant">
                            {t.ticket_number} •{" "}
                            {new Date(t.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold tracking-widest text-on-surface-variant">
                        {t.status?.toUpperCase().replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
