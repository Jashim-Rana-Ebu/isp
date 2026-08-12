import { Cable, CheckCircle, ArrowRight } from "lucide-react";

const integrations = [
  { name: "Mikrotik", color: "text-primary", angle: 0 },
  { name: "Stripe", color: "text-status-optimal", angle: 90 },
  { name: "bKash", color: "text-tertiary", angle: 180 },
  { name: "WhatsApp", color: "text-secondary-container", angle: 270 },
  { name: "RADIUS", color: "text-primary-fixed", angle: 45 },
  { name: "Nagad", color: "text-status-latency", angle: 135 },
  { name: "SMS", color: "text-on-surface-variant", angle: 225 },
  { name: "Email", color: "text-primary", angle: 315 },
];

const features = [
  "One-click Mikrotik & RADIUS provisioning",
  "Local & international payment gateways",
  "REST API & webhooks for automation",
  "Real-time SMS & email notifications",
];

export default function IntegrationsSection() {
  return (
    <section className="py-12 px-6 md:px-8 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#2A2A35 1px, transparent 1px), linear-gradient(90deg, #2A2A35 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* Left Content */}
        <div className="lg:w-1/2 z-10">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary-container font-mono text-xs px-3 py-1 rounded-full mb-6 border border-primary-container/20 tracking-widest font-bold">
            <Cable size={14} />
            EASY INTEGRATION
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl mb-6">
            Plug into your{" "}
            <span className="text-primary-container">network & tools</span> in minutes
          </h2>
          <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
            Connect Mikrotik routers, payment gateways, SMS, and email providers with a guided
            setup. No scripts, no headaches — just clean dashboards from day one.
          </p>
          <ul className="space-y-4 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle size={20} className="text-status-optimal mt-0.5 flex-shrink-0" />
                <span className="text-on-surface">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Orbiting Visual */}
        <div className="lg:w-1/2 flex justify-center z-10">
          <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] flex items-center justify-center">
            {/* Central Hub */}
            <div className="absolute z-20 w-24 h-24 bg-primary-container rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(98,0,234,0.5)] flex-col gap-1">
              <div className="w-8 h-8 grid grid-cols-2 gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-white/80 rounded-sm" />
                ))}
              </div>
              <span className="font-mono text-[9px] text-white/80 font-bold tracking-widest">HUB</span>
            </div>

            {/* Static inner orbit ring */}
            <div className="absolute w-[160px] h-[160px] border border-border-muted/50 rounded-full" />

            {/* Outer orbit ring — spinning */}
            <div
              className="absolute w-[300px] h-[300px] md:w-[360px] md:h-[360px] border border-dashed border-outline-variant/60 rounded-full orbit-ring"
              style={{ animationDuration: "25s" }}
            >
              {integrations.slice(0, 4).map(({ name, color, angle }) => (
                <div
                  key={name}
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translateY(-180px) translateX(-50%)`,
                    transformOrigin: "0 0",
                  }}
                >
                  <div
                    className="bg-surface-card border border-border-muted px-3 py-2 rounded-xl shadow-lg flex items-center justify-center"
                    style={{
                      transform: `rotate(-${angle}deg)`,
                    }}
                  >
                    <span className={`font-mono text-xs font-bold ${color}`}>{name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Second orbit ring — counter spin */}
            <div
              className="absolute w-[220px] h-[220px] md:w-[260px] md:h-[260px] border border-dashed border-outline-variant/40 rounded-full"
              style={{
                animation: "orbitSpin 18s linear infinite reverse",
              }}
            >
              {integrations.slice(4).map(({ name, color, angle }) => (
                <div
                  key={name}
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translateY(-130px) translateX(-50%)`,
                    transformOrigin: "0 0",
                  }}
                >
                  <div
                    className="bg-surface-card border border-border-muted px-2 py-1 rounded-lg shadow-lg"
                    style={{ transform: `rotate(-${angle}deg)` }}
                  >
                    <span className={`font-mono text-[10px] font-bold ${color}`}>{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
