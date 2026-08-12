import { Star } from "lucide-react";

const testimonials = [
  {
    initials: "AK",
    name: "Ahmed Khan",
    title: "CEO, FastNet ISP",
    quote:
      "Switching to this platform cut our admin work by 60%. Billing runs automatically and our team finally focuses on growth, not paperwork.",
    bgColor: "bg-primary-container",
    textColor: "text-white",
  },
  {
    initials: "SR",
    name: "Sarah Rahman",
    title: "Ops Head, SkyLink",
    quote:
      "The Mikrotik integration is butter-smooth. Provisioning a new client takes 30 seconds — what used to take 15 minutes.",
    bgColor: "bg-tertiary-container",
    textColor: "text-white",
  },
  {
    initials: "MH",
    name: "Mohammed Hassan",
    title: "Founder, ConnectBD",
    quote:
      "Client portal, online bill pay and ticket system — all in one place. Our customers love it and so does our finance team.",
    bgColor: "bg-secondary-container",
    textColor: "text-on-secondary-container",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-12 px-6 md:px-8 relative overflow-hidden" id="customers">
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
          <h2 className="font-grotesk text-4xl md:text-5xl mb-4">
            What our <span className="text-primary-container">clients say</span>
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            Trusted by network engineers across the country.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ initials, name, title, quote, bgColor, textColor }) => (
            <div
              key={name}
              className="bg-surface-card border border-border-muted p-6 rounded-xl hover:border-outline-variant transition-colors group"
            >
              {/* Stars */}
              <div className="flex text-status-latency mb-4 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-on-surface-variant mb-6 text-sm leading-relaxed">
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center font-bold ${textColor} text-sm flex-shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <div className="font-bold text-sm">{name}</div>
                  <div className="text-xs text-on-surface-variant">{title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {[
            { value: "500+", label: "ISPs powered" },
            { value: "50,000+", label: "Active subscribers" },
            { value: "99.9%", label: "Average uptime" },
            { value: "24/7", label: "Support availability" },
            { value: "4.9★", label: "Average rating" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-mono text-2xl font-bold text-primary-container mb-1">{value}</div>
              <div className="font-mono text-xs text-on-surface-variant tracking-widest">{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
