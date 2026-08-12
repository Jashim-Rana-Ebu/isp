import { Tag, Check, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "starter",
    name: "STARTER",
    price: "1,000",
    description: "For small ISPs just getting started.",
    features: ["Up to 100 clients", "Mikrotik integration", "Automated billing", "Email support"],
    cta: "Choose Starter",
    featured: false,
    checkIcon: Check,
    checkColor: "text-status-optimal",
  },
  {
    id: "business",
    name: "BUSINESS",
    price: "1,500",
    description: "Best for growing ISP businesses.",
    features: [
      "Up to 1,000 clients",
      "All integrations",
      "Priority support",
      "Advanced reports",
      "RADIUS management",
      "Multi-branch support",
    ],
    cta: "Choose Business",
    featured: true,
    checkIcon: CheckCircle,
    checkColor: "text-primary-container",
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "2,500",
    description: "For large operations & resellers.",
    features: [
      "Unlimited clients",
      "Custom integrations",
      "SLA + 24/7 support",
      "Dedicated account manager",
    ],
    cta: "Talk to Sales",
    featured: false,
    checkIcon: Check,
    checkColor: "text-status-optimal",
  },
];

export default function PricingSection() {
  return (
    <section className="py-12 px-6 md:px-8 relative overflow-hidden" id="pricing">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#2A2A35 1px, transparent 1px), linear-gradient(90deg, #2A2A35 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-primary font-mono text-xs bg-primary/10 px-3 py-1 rounded-full mb-4 tracking-widest font-bold">
            <Tag size={14} />
            PRICING
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl mb-4">
            Simple & transparent{" "}
            <span className="text-primary-container">pricing</span>
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            Choose a plan that fits your business size. Upgrade or downgrade anytime — no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map(({ id, name, price, description, features, cta, featured, checkIcon: CheckIcon, checkColor }) => (
            <div
              key={id}
              className={`rounded-2xl p-8 flex flex-col relative transition-all duration-300 ${
                featured
                  ? "bg-surface-container-high border-2 border-primary-container md:-translate-y-4 pricing-card-featured"
                  : "bg-surface-card border border-border-muted hover:border-outline-variant"
              }`}
            >
              {featured && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-container text-white font-mono text-[10px] px-4 py-1 rounded-full tracking-widest font-bold">
                  MOST POPULAR
                </div>
              )}

              <h3
                className={`font-mono text-xs tracking-widest font-bold mb-2 ${
                  featured ? "text-primary-container" : "text-primary"
                }`}
              >
                {name}
              </h3>

              <div className="mb-4">
                <span className="text-2xl align-top text-on-surface mt-1 inline-block">৳</span>
                <span className="font-grotesk text-5xl font-bold">{price}</span>
                <span className="text-on-surface-variant">/month</span>
              </div>

              <p className="text-on-surface-variant text-sm mb-8 border-b border-border-muted pb-6 leading-relaxed">
                {description}
              </p>

              <ul className="space-y-4 mb-8 flex-grow">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckIcon size={18} className={`${checkColor} flex-shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                id={`pricing-${id}-cta`}
                className={`w-full py-3 rounded-lg font-bold text-center transition-colors block ${
                  featured
                    ? "bg-primary-container text-white hover:opacity-90 neon-glow"
                    : "bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-variant"
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-on-surface-variant mt-10 flex items-center justify-center gap-2">
          <Zap size={14} className="text-primary-container" />
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
