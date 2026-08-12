import { Star, LayoutDashboard, Settings, GitBranch, Users, Package, Handshake, Wifi, Shield, BarChart2, Bell, Map, ChevronRight } from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Informative Dashboard",
    items: ["Business Dashboard", "Accounting Dashboard"],
  },
  {
    icon: Settings,
    title: "Configuration",
    items: ["Business Configuration", "Location Configuration"],
  },
  {
    icon: GitBranch,
    title: "Multiple Branch",
    items: ["Company Management", "Branch Management"],
  },
  {
    icon: Users,
    title: "CRM & Billing",
    items: ["Client Management", "Automated Invoicing"],
  },
  {
    icon: Package,
    title: "Inventory",
    items: ["Bandwidth Tracking", "Hardware Stock"],
  },
  {
    icon: Handshake,
    title: "Resellers Manage",
    items: ["MAC Reseller Control", "Bandwidth Allocation"],
  },
  {
    icon: Wifi,
    title: "Network Monitor",
    items: ["Real-time OLT Status", "Mikrotik Integration"],
  },
  {
    icon: Shield,
    title: "Security & RADIUS",
    items: ["RADIUS Authentication", "MAC Address Control"],
  },
  {
    icon: BarChart2,
    title: "Reports & Analytics",
    items: ["Revenue Reports", "Client Analytics"],
  },
  {
    icon: Bell,
    title: "Helpdesk & Tickets",
    items: ["Ticket Management", "SMS/Email Alerts"],
  },
  {
    icon: Map,
    title: "GIS & Mapping",
    items: ["Network Topology Map", "Client Location Pins"],
  },
  {
    icon: Users,
    title: "Staff Management",
    items: ["Role-based Access", "Activity Logs"],
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 px-6 md:px-8 relative overflow-hidden" id="features">
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
          <div className="inline-flex items-center gap-2 text-primary font-mono text-label-caps mb-4">
            <Star size={14} className="text-primary" />
            <span className="tracking-widest text-xs font-bold">POWERFUL FEATURES</span>
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl mb-4">
            What We Offer{" "}
            <span className="text-primary-container">modern ISP</span>
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            Comprehensive internet solutions for homes and businesses, packaged in high-density modules.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {features.map(({ icon: Icon, title, items }) => (
            <div
              key={title}
              className="bg-surface-card border border-border-muted p-6 rounded-2xl hover:border-outline-variant transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-5 group-hover:scale-110 transition-transform">
                <Icon size={22} />
              </div>
              <h3 className="font-grotesk text-lg font-semibold mb-3">{title}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-sm bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
