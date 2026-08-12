"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Save, Lock } from "lucide-react";

export default function CustomerProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      setCustomer(data);
      if (data) {
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("customers")
      .update({
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
      })
      .eq("id", customer.id);
      
    setSaving(false);
    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Loading profile...</div>;

  const inputClass = "form-input-dark text-sm w-full";
  const labelClass = "block text-sm font-medium text-on-surface-variant mb-1 mt-4";

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
          <User size={28} className="text-primary" /> My Profile
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">Manage your account information and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface-card border border-border-muted rounded-xl p-6 md:p-8">
            <h2 className="font-grotesk font-semibold text-lg border-b border-border-muted pb-3 mb-4">Personal Information</h2>
            
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input required className={inputClass} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="tel" className={inputClass} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" className={inputClass} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Full Address</label>
                <input className={inputClass} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              
              <div className="mt-6 pt-6 border-t border-border-muted flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                  <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-surface-card border border-border-muted rounded-xl p-6 md:p-8">
            <h2 className="font-grotesk font-semibold text-lg border-b border-border-muted pb-3 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-on-surface-variant" /> Change Password
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              To change your password, please request a password reset email using the button below.
            </p>
            <button className="btn-secondary text-sm">Send Password Reset Email</button>
          </div>
        </div>

        <div>
          <div className="bg-surface-container rounded-xl p-6 sticky top-6">
            <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">
              {form.name ? form.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h3 className="font-grotesk font-semibold text-center text-lg">{form.name}</h3>
            <p className="text-center text-sm text-on-surface-variant font-mono mt-1 mb-6">
              {customer?.client_id ?? "PENDING"}
            </p>
            
            <div className="space-y-3 pt-4 border-t border-border-muted text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Account Status</span>
                <span className="font-mono font-bold text-status-optimal">{customer?.status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Member Since</span>
                <span className="font-mono">{new Date(customer?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
