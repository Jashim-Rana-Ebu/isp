"use client";

import { useState } from "react";
import { HelpCircle, Plus, X } from "lucide-react";

const faqs = [
  {
    q: "What does this platform do?",
    a: "It is a complete management system for Internet Service Providers — covering clients, billing, bandwidth, helpdesk, reports and more, all in one dashboard.",
  },
  {
    q: "Does it integrate with Mikrotik?",
    a: "Yes. Ultimate ISP has native Mikrotik RouterOS integration via the API. You can provision new clients, manage bandwidth profiles, and monitor routers directly from the dashboard.",
  },
  {
    q: "Can I accept online payments?",
    a: "Absolutely. We support multiple local payment gateways including bKash, Nagad, Rocket, and international gateways like Stripe. Clients can pay invoices online through the client portal.",
  },
  {
    q: "Is migration support included?",
    a: "Yes. Our onboarding team will assist you with migrating your existing client data from spreadsheets or other software. Enterprise plans include dedicated migration support.",
  },
  {
    q: "Can I manage multiple branches?",
    a: "Yes. The platform supports multi-company and multi-branch setups, each with their own staff, clients, reports and billing configurations.",
  },
  {
    q: "Is there a mobile app?",
    a: "The platform is fully responsive and works on mobile browsers. A dedicated native mobile app is on the roadmap for Q3 2026.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 px-6 md:px-8 relative overflow-hidden" id="faq">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#2A2A35 1px, transparent 1px), linear-gradient(90deg, #2A2A35 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary-container font-mono text-xs px-3 py-1 rounded-full mb-4 border border-primary-container/20 tracking-widest font-bold">
            <HelpCircle size={14} />
            FAQ
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl mb-4">
            Frequently asked{" "}
            <span className="text-primary-container">questions</span>
          </h2>
          <p className="text-on-surface-variant text-lg">
            Everything you need to know about the platform. Can&apos;t find an answer? Reach out to our team.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map(({ q, a }, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={q}
                className={`bg-surface-card rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen ? "border border-primary-container" : "border border-border-muted hover:border-outline-variant"
                }`}
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  id={`faq-${i}`}
                  aria-expanded={isOpen}
                >
                  <span className="font-grotesk text-lg font-semibold">{q}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen
                        ? "bg-primary-container text-white"
                        : "bg-surface-container-high text-primary-container"
                    }`}
                  >
                    {isOpen ? <X size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-on-surface-variant leading-relaxed animate-fade-in-up">
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
