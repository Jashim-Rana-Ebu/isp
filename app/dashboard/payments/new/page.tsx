"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard,
  Search,
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

type Customer = {
  id: string;
  name: string;
  client_id: string;
  phone: string | null;
};

type Invoice = {
  id: string;
  invoice_number: string;
  period_month: number;
  period_year: number;
  total_amount: number;
  status: string;
};

export default function NewPaymentPage() {
  const supabase = createClient();
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({
    amount: 0,
    gateway: "cash",
    gateway_transaction_id: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const searchCustomers = useCallback(async () => {
    if (!customerSearch.trim()) {
      setCustomers([]);
      return;
    }
    const { data } = await supabase
      .from("customers")
      .select("id, name, client_id, phone")
      .or(
        `name.ilike.%${customerSearch}%,client_id.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%`
      )
      .limit(8);
    setCustomers(data ?? []);
    setShowDropdown(true);
  }, [customerSearch]);

  useEffect(() => {
    const timer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timer);
  }, [searchCustomers]);

  const selectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDropdown(false);
    setCustomerSearch(customer.name);
    setSelectedInvoice(null);

    // Fetch unpaid invoices for this customer
    const { data } = await supabase
      .from("invoices")
      .select("id, invoice_number, period_month, period_year, total_amount, status")
      .eq("customer_id", customer.id)
      .in("status", ["unpaid", "overdue", "partial"])
      .order("created_at", { ascending: false });
    setInvoices(data ?? []);
  };

  const handleInvoiceSelect = (invoice: Invoice | null) => {
    setSelectedInvoice(invoice);
    if (invoice) {
      setForm((prev) => ({ ...prev, amount: Number(invoice.total_amount) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const now = new Date().toISOString();

      const { error: payErr } = await supabase.from("payments").insert({
        invoice_id: selectedInvoice?.id ?? null,
        customer_id: selectedCustomer.id,
        amount: form.amount,
        gateway: form.gateway,
        gateway_transaction_id: form.gateway_transaction_id || null,
        notes: form.notes || null,
        status: "completed",
        paid_at: now,
      });

      if (payErr) throw payErr;

      // If linked to invoice, update it
      if (selectedInvoice) {
        await supabase
          .from("invoices")
          .update({ status: "paid", paid_date: now })
          .eq("id", selectedInvoice.id);
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/payments"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/payments"
          className="w-9 h-9 rounded-lg bg-surface-card border border-border-muted flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-grotesk text-2xl font-bold flex items-center gap-2">
            <CreditCard size={24} className="text-primary" /> Record Manual
            Payment
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Record cash or offline payment for a customer
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-status-optimal/10 border border-status-optimal/20 text-status-optimal">
          <CheckCircle size={18} />
          <div>
            <div className="font-semibold">Payment recorded successfully!</div>
            <div className="text-sm opacity-80">Redirecting to payment history...</div>
          </div>
        </div>
      )}

      <div className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Search */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <h2 className="font-grotesk font-semibold text-sm mb-4">
              1. Select Customer
            </h2>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                type="text"
                placeholder="Search by name, client ID, or phone..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  if (!e.target.value) {
                    setSelectedCustomer(null);
                    setInvoices([]);
                  }
                }}
                onFocus={() => customers.length > 0 && setShowDropdown(true)}
                className="form-input-dark pl-9 text-sm w-full"
              />
              {showDropdown && customers.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-surface-container border border-border-muted rounded-xl overflow-hidden z-10 shadow-xl">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="font-mono text-[10px] text-on-surface-variant">
                          {c.client_id} {c.phone && `• ${c.phone}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="mt-3 p-3 rounded-lg bg-status-optimal/5 border border-status-optimal/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{selectedCustomer.name}</div>
                  <div className="font-mono text-[10px] text-on-surface-variant">
                    {selectedCustomer.client_id}{" "}
                    {selectedCustomer.phone && `• ${selectedCustomer.phone}`}
                  </div>
                </div>
                <CheckCircle size={16} className="text-status-optimal" />
              </div>
            )}
          </div>

          {/* Invoice Selection */}
          {selectedCustomer && (
            <div className="bg-surface-card border border-border-muted rounded-xl p-5">
              <h2 className="font-grotesk font-semibold text-sm mb-4">
                2. Link to Invoice (Optional)
              </h2>
              {invoices.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  No unpaid invoices for this customer
                </p>
              ) : (
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedInvoice === null
                        ? "border-primary/50 bg-primary/5"
                        : "border-border-muted hover:bg-surface-container"
                    }`}
                  >
                    <input
                      type="radio"
                      name="invoice"
                      className="accent-primary"
                      checked={selectedInvoice === null}
                      onChange={() => handleInvoiceSelect(null)}
                    />
                    <div className="flex-1 ml-3">
                      <div className="text-sm font-medium">
                        No invoice (advance/deposit payment)
                      </div>
                    </div>
                  </label>
                  {invoices.map((inv) => (
                    <label
                      key={inv.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedInvoice?.id === inv.id
                          ? "border-primary/50 bg-primary/5"
                          : "border-border-muted hover:bg-surface-container"
                      }`}
                    >
                      <input
                        type="radio"
                        name="invoice"
                        className="accent-primary"
                        checked={selectedInvoice?.id === inv.id}
                        onChange={() => handleInvoiceSelect(inv)}
                      />
                      <div className="flex-1 ml-3">
                        <div className="font-mono text-xs text-primary">
                          {inv.invoice_number}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {String(inv.period_month).padStart(2, "0")}/
                          {inv.period_year}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">
                          ৳{Number(inv.total_amount).toLocaleString()}
                        </div>
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            inv.status === "overdue"
                              ? "text-status-outage"
                              : "text-status-latency"
                          }`}
                        >
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-surface-card border border-border-muted rounded-xl p-5">
            <h2 className="font-grotesk font-semibold text-sm mb-4">
              3. Payment Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  Amount (৳) *
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
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  Payment Method *
                </label>
                <select
                  required
                  className="form-input-dark text-sm w-full"
                  value={form.gateway}
                  onChange={(e) =>
                    setForm({ ...form, gateway: e.target.value })
                  }
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
                  <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                    Transaction ID
                  </label>
                  <input
                    className="form-input-dark text-sm w-full"
                    placeholder="e.g. TXN123456"
                    value={form.gateway_transaction_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gateway_transaction_id: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  Notes
                </label>
                <input
                  className="form-input-dark text-sm w-full"
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-status-outage/10 text-status-outage text-sm border border-status-outage/20">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/dashboard/payments" className="btn-secondary text-sm py-3 flex-1">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !selectedCustomer || success}
              className="btn-primary text-sm py-3 flex-1 disabled:opacity-60"
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
