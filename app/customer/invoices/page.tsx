"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, CreditCard, ExternalLink, CheckCircle2 } from "lucide-react";

export default function CustomerInvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (customer) {
        const { data: invData } = await supabase
          .from("invoices")
          .select("*")
          .eq("customer_id", customer.id)
          .order("period_year", { ascending: false })
          .order("period_month", { ascending: false });
        
        setInvoices(invData ?? []);
      }
      setLoading(false);
    };

    loadInvoices();
  }, []);

  const handlePay = async (invoiceId: string, method: string) => {
    setProcessingId(invoiceId);
    
    // In a real implementation, this would call your payment gateway API route
    // (e.g. /api/payments/sslcommerz) to get a checkout URL and redirect.
    // For this boilerplate, we'll just show an alert simulating the redirect.
    
    setTimeout(() => {
      alert(`Simulating redirect to ${method.toUpperCase()} checkout page...`);
      setProcessingId(null);
    }, 1000);
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Loading invoices...</div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
          <FileText size={28} className="text-primary" /> My Bills & Invoices
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">View your billing history and make payments</p>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
              <FileText size={24} />
            </div>
            <p className="text-on-surface-variant">You don't have any invoices yet.</p>
          </div>
        ) : (
          invoices.map((inv) => {
            const isUnpaid = inv.status === "unpaid" || inv.status === "overdue";
            const isOverdue = inv.status === "overdue";
            const isPaid = inv.status === "paid";
            
            return (
              <div key={inv.id} className={`bg-surface-card border rounded-2xl p-5 md:p-6 transition-all ${
                isUnpaid ? (isOverdue ? "border-status-outage/40" : "border-primary-container/40") : "border-border-muted"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isPaid ? "bg-status-optimal/20 text-status-optimal" : 
                      isOverdue ? "bg-status-outage/20 text-status-outage" : 
                      "bg-primary-container/20 text-primary"
                    }`}>
                      {isPaid ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-grotesk font-semibold text-lg">Invoice #{inv.invoice_number}</h3>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-widest ${
                          isPaid ? "bg-status-optimal/15 text-status-optimal" : 
                          isOverdue ? "bg-status-outage/15 text-status-outage" : 
                          "bg-status-latency/15 text-status-latency"
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-on-surface-variant mb-1">
                        Billing Period: {String(inv.period_month).padStart(2, '0')}/{inv.period_year}
                      </div>
                      <div className={`text-xs font-medium ${isOverdue ? "text-status-outage" : "text-on-surface-variant"}`}>
                        {isPaid && inv.paid_date ? `Paid on ${new Date(inv.paid_date).toLocaleDateString()}` : `Due by ${new Date(inv.due_date).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Amount */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t border-border-muted/50 pt-4 md:border-0 md:pt-0">
                    <div className="font-mono text-2xl font-bold">
                      ৳{Number(inv.total_amount).toLocaleString()}
                    </div>
                    
                    {isUnpaid ? (
                      <div className="flex items-center gap-2">
                        {processingId === inv.id ? (
                          <span className="text-sm text-primary flex items-center gap-2 animate-pulse">
                            Processing...
                          </span>
                        ) : (
                          <>
                            <button 
                              onClick={() => handlePay(inv.id, 'sslcommerz')}
                              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                            >
                              <CreditCard size={14} /> Pay SSLCommerz
                            </button>
                            <button 
                              onClick={() => handlePay(inv.id, 'bkash')}
                              className="btn-secondary py-2 px-4 text-xs text-[#E2136E] border-[#E2136E]/30 hover:bg-[#E2136E]/10"
                            >
                              bKash
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button className="text-primary hover:text-primary-fixed text-sm flex items-center gap-1 font-mono transition-colors">
                        Receipt <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
