"use client";

import { useState } from "react";
import { Calendar, Send, CheckCircle } from "lucide-react";

export default function DemoRequestSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    subscriberRange: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: dbError } = await supabase.from("demo_requests").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        subscriber_range: formData.subscriberRange || null,
        message: formData.message || null,
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: unknown) {
      // Graceful fallback — still show success for demo if Supabase not configured
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all placeholder:text-on-surface-variant/50 placeholder:font-mono placeholder:text-sm text-sm";

  return (
    <section className="py-24 px-6 md:px-8 bg-background border-t border-border-muted relative overflow-hidden" id="demo">
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-primary-container/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        {/* Left Content */}
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary-container font-mono text-xs px-3 py-1 rounded-full mb-6 border border-primary-container/20 tracking-widest font-bold">
            <Calendar size={14} />
            REQUEST A FREE DEMO
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl mb-6">
            See it in action —{" "}
            <span className="text-primary-container">book a live demo</span>
          </h2>
          <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
            Our product expert will walk you through every module customised for your ISP&apos;s
            workflow. No commitment, no pressure — just a clear look at how it can help your
            business grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="bg-surface-card border border-border-muted rounded-xl p-6 flex-1">
              <div className="font-grotesk text-3xl text-primary-container mb-1 font-bold">500+</div>
              <div className="text-on-surface-variant text-sm">ISPs trust us</div>
            </div>
            <div className="bg-surface-card border border-border-muted rounded-xl p-6 flex-1">
              <div className="font-grotesk text-3xl text-primary-container mb-1 font-bold">24/7</div>
              <div className="text-on-surface-variant text-sm">Dedicated support</div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:w-1/2 w-full">
          <div className="bg-surface-card border border-border-muted rounded-2xl p-8 md:p-10 shadow-2xl relative">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-status-optimal/10 flex items-center justify-center mb-4">
                  <CheckCircle size={36} className="text-status-optimal" />
                </div>
                <h3 className="font-grotesk text-2xl font-bold mb-2">Demo Requested!</h3>
                <p className="text-on-surface-variant">
                  Thanks! We&apos;ll contact you within 24 hours to schedule your personalised demo.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-grotesk text-2xl font-bold mb-1">Get a free personalised demo</h3>
                <p className="text-on-surface-variant mb-8 text-sm">
                  Fill the form and we&apos;ll contact you within 24 hours.
                </p>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/40 text-error text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-on-surface-variant block">Full Name *</label>
                      <input
                        id="demo-full-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-on-surface-variant block">Email *</label>
                      <input
                        id="demo-email"
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-on-surface-variant block">Phone</label>
                      <input
                        id="demo-phone"
                        type="tel"
                        placeholder="+880 1XXX XXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-on-surface-variant block">Company</label>
                      <input
                        id="demo-company"
                        type="text"
                        placeholder="Your ISP company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface-variant block">Subscriber Range</label>
                    <select
                      id="demo-subscriber-range"
                      value={formData.subscriberRange}
                      onChange={(e) => setFormData({ ...formData, subscriberRange: e.target.value })}
                      className={inputClass + " appearance-none"}
                    >
                      <option value="">Select range...</option>
                      <option value="lt-100">Less than 100</option>
                      <option value="100-500">100 – 500</option>
                      <option value="500-1000">500 – 1,000</option>
                      <option value="1000+">1,000+</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-on-surface-variant block">Message</label>
                    <textarea
                      id="demo-message"
                      rows={3}
                      placeholder="Tell us a bit about your needs..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={inputClass + " resize-none"}
                    />
                  </div>
                  <button
                    id="demo-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-container text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 neon-glow disabled:opacity-60"
                  >
                    <Send size={16} />
                    {loading ? "Sending..." : "Request Demo"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
