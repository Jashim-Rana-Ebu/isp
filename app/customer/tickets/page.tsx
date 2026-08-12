"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Plus, X, Send } from "lucide-react";

export default function CustomerTicketsPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  
  // New ticket state
  const [showNewForm, setShowNewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", category: "general", priority: "medium", description: "" });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: custData } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    
    setCustomer(custData);

    if (custData) {
      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("customer_id", custData.id)
        .order("created_at", { ascending: false });
      setTickets(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSubmitting(true);
    
    const { error } = await supabase.from("tickets").insert({
      customer_id: customer.id,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      description: newTicket.description,
      status: "open"
    });

    setSubmitting(false);
    if (error) {
      alert(error.message);
    } else {
      setShowNewForm(false);
      setNewTicket({ subject: "", category: "general", priority: "medium", description: "" });
      fetchTickets();
    }
  };

  const statusColors: Record<string, string> = {
    open: "bg-status-latency/20 text-status-latency border-status-latency/30",
    in_progress: "bg-tertiary/20 text-tertiary border-tertiary/30",
    resolved: "bg-status-optimal/20 text-status-optimal border-status-optimal/30",
    closed: "bg-on-surface-variant/20 text-on-surface-variant border-border-muted",
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MessageSquare size={28} className="text-primary" /> Support Tickets
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Need help? Open a ticket and our team will assist you.</p>
        </div>
        <button onClick={() => setShowNewForm(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {showNewForm && (
        <div className="bg-surface-card border border-primary-container/40 rounded-xl p-6 mb-8 relative">
          <button onClick={() => setShowNewForm(false)} className="absolute top-4 right-4 p-1 hover:bg-surface-container rounded-lg">
            <X size={20} className="text-on-surface-variant" />
          </button>
          
          <h2 className="font-grotesk text-xl font-semibold mb-6">Create New Ticket</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Subject</label>
              <input required type="text" placeholder="Brief description of the issue" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} className="form-input-dark text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Category</label>
                <select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} className="form-input-dark text-sm">
                  <option value="general">General Inquiry</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="network">Network/Internet Issue</option>
                  <option value="installation">Installation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Priority</label>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})} className="form-input-dark text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
              <textarea required rows={4} placeholder="Please provide details about your issue..." value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="form-input-dark text-sm resize-none" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={submitting} className="btn-primary text-sm flex items-center gap-2 w-full md:w-auto justify-center">
                <Send size={16} /> {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
              <MessageSquare size={24} />
            </div>
            <p className="text-on-surface-variant">You don't have any support tickets.</p>
          </div>
        ) : (
          tickets.map(t => (
            <div key={t.id} className="bg-surface-card border border-border-muted rounded-xl p-5 hover:border-outline-variant transition-colors cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <h3 className="font-grotesk font-semibold text-lg">{t.subject}</h3>
                <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-widest border ${statusColors[t.status] ?? ""}`}>
                  {t.status.toUpperCase().replace("_", " ")}
                </span>
              </div>
              <div className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                {t.description}
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-on-surface-variant/70 border-t border-border-muted/50 pt-3">
                <span>TICKET #{t.ticket_number}</span>
                <span>•</span>
                <span>{new Date(t.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="uppercase">{t.category}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
