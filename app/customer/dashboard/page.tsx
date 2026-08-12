"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, FileText, Wifi, AlertCircle, ArrowRight } from "lucide-react";

export default function CustomerDashboardPage() {
  const supabase = createClient();
  const [customer, setCustomer] = useState<any>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch customer data
      const { data: custData } = await supabase
        .from("customers")
        .select("*, package:packages(*)")
        .eq("user_id", user.id)
        .single();
      
      setCustomer(custData);

      if (custData) {
        // Fetch unpaid invoices
        const { data: invoices } = await supabase
          .from("invoices")
          .select("*")
          .eq("customer_id", custData.id)
          .in("status", ["unpaid", "overdue"])
          .order("due_date", { ascending: true });
        
        setUnpaidInvoices(invoices ?? []);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center text-on-surface-variant">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center mt-20">
        <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-status-latency" />
        </div>
        <h1 className="font-grotesk text-2xl font-bold mb-3">Account Pending</h1>
        <p className="text-on-surface-variant mb-6">
          Your account has been created but is not yet linked to an active internet connection. Our team is processing your request.
        </p>
      </div>
    );
  }

  const totalDue = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const isOverdue = unpaidInvoices.some(inv => inv.status === "overdue");

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-grotesk text-2xl md:text-3xl font-bold">Welcome back, {customer.name.split(" ")[0]}!</h1>
        <p className="text-on-surface-variant text-sm mt-1">Here is a summary of your account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Billing Card */}
        <div className={`md:col-span-2 rounded-2xl p-6 md:p-8 relative overflow-hidden ${
          totalDue > 0 
            ? isOverdue ? "bg-status-outage/10 border border-status-outage/30" : "bg-primary-container/10 border border-primary-container/30"
            : "bg-surface-card border border-border-muted"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-on-surface-variant font-medium text-sm mb-2 uppercase tracking-wider font-mono">Current Balance</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl text-on-surface-variant">৳</span>
                <span className={`font-grotesk text-4xl md:text-5xl font-bold ${
                  totalDue > 0 ? (isOverdue ? "text-status-outage" : "text-primary") : "text-on-surface"
                }`}>
                  {totalDue.toLocaleString()}
                </span>
              </div>
              
              {totalDue > 0 ? (
                <p className={`text-sm ${isOverdue ? "text-status-outage font-bold" : "text-on-surface-variant"}`}>
                  {isOverdue ? "You have overdue invoices!" : `Due by ${new Date(unpaidInvoices[0].due_date).toLocaleDateString()}`}
                </p>
              ) : (
                <p className="text-sm text-status-optimal font-medium">All caught up! No pending bills.</p>
              )}
            </div>
            
            {totalDue > 0 && (
              <Link 
                href="/customer/invoices" 
                className={`px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                  isOverdue ? "bg-status-outage text-white shadow-status-outage/20" : "bg-primary text-white shadow-primary/20"
                }`}
              >
                <CreditCard size={18} />
                Pay Now
              </Link>
            )}
          </div>
          
          {/* Decorative background circle */}
          <div className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
            totalDue > 0 ? (isOverdue ? "bg-status-outage" : "bg-primary") : "bg-surface-variant"
          }`} />
        </div>

        {/* Current Plan */}
        <div className="bg-surface-card border border-border-muted rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wifi size={18} className="text-status-optimal" />
              <h2 className="font-grotesk font-semibold">Current Plan</h2>
            </div>
            {customer.package ? (
              <>
                <div className="font-mono text-xl font-bold mb-1">{customer.package.name}</div>
                <div className="text-sm text-on-surface-variant mb-4">
                  ৳{Number(customer.package.price).toLocaleString()} / month
                </div>
                <div className="flex gap-4">
                  <div>
                    <div className="text-[10px] uppercase text-on-surface-variant mb-0.5 font-mono">Download</div>
                    <div className="font-mono text-sm font-bold text-primary">{customer.package.bandwidth_down || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-on-surface-variant mb-0.5 font-mono">Upload</div>
                    <div className="font-mono text-sm font-bold text-tertiary">{customer.package.bandwidth_up || "—"}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-on-surface-variant">No active package assigned.</div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-border-muted flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Status:</span>
            <span className="inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest bg-status-optimal/10 text-status-optimal">
              {customer.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Invoices Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-grotesk text-lg font-semibold">Unpaid Bills</h2>
          <Link href="/customer/invoices" className="text-sm text-primary hover:underline flex items-center gap-1 font-mono">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="space-y-3">
          {unpaidInvoices.length === 0 ? (
            <div className="bg-surface-card border border-border-muted rounded-xl p-6 text-center text-on-surface-variant text-sm">
              You have no unpaid bills at this time.
            </div>
          ) : (
            unpaidInvoices.slice(0, 3).map(inv => (
              <div key={inv.id} className="bg-surface-card border border-border-muted rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-outline-variant">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    inv.status === "overdue" ? "bg-status-outage/15 text-status-outage" : "bg-primary-container/20 text-primary"
                  }`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Invoice for {String(inv.period_month).padStart(2, "0")}/{inv.period_year}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Due: {new Date(inv.due_date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="font-mono font-bold text-lg">
                    ৳{Number(inv.total_amount).toLocaleString()}
                  </div>
                  <Link href="/customer/invoices" className="btn-secondary py-1.5 px-4 text-xs">
                    Pay
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
