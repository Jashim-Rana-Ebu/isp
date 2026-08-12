import Link from "next/link";
import { Rocket, ArrowRight, TrendingUp, BarChart2, Zap, CheckCircle } from "lucide-react";

interface HeroSectionProps {}

export default function HeroSection({}: HeroSectionProps) {
  return (
    <header className="relative pt-24 pb-12 px-6 md:px-8 overflow-hidden flex flex-col items-center text-center">
      {/* Abstract Background Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#2A2A35 1px, transparent 1px), linear-gradient(90deg, #2A2A35 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Purple glow blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Version Badge */}
      <div className="inline-flex items-center gap-2 bg-surface-container-high border border-outline-variant rounded-full px-4 py-1 mb-8 z-10">
        <span className="bg-primary-container text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest">
          NEW
        </span>
        <span className="font-mono text-sm text-on-surface-variant">v2.0 — Complete ISP CRM platform</span>
      </div>

      {/* Headline */}
      <h1 className="font-grotesk text-5xl md:text-7xl max-w-4xl mb-6 tracking-tight leading-tight z-10">
        Experience the Future of{" "}
        <br className="hidden md:block" />
        <span className="text-primary-container relative">
          Connectivity Business
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary-container to-transparent opacity-50" />
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-on-surface-variant max-w-2xl mb-12 text-lg leading-relaxed z-10">
        Blazing fast fiber optic internet management with 99.9% uptime guarantee. Automate
        billing, monitor networks, and scale your ISP operations from a single command center.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16 z-10">
        <Link
          href="/register"
          id="hero-get-started"
          className="bg-primary-container text-white px-8 py-3.5 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg neon-glow"
        >
          <Rocket size={20} />
          Get Started Now
        </Link>
        <Link
          href="#features"
          className="bg-surface-container border border-outline-variant text-on-surface px-8 py-3.5 rounded-lg font-bold hover:bg-surface-variant transition-all flex items-center justify-center gap-2 text-lg"
        >
          <ArrowRight size={20} />
          See Features
        </Link>
      </div>
    </header>
  );
}
