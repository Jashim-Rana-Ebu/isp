"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Router, Zap, Menu, X } from "lucide-react";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only prevent default and scroll if we're on the home page
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    }
    // Otherwise, let the Link component handle navigation normally
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If we're not on the home page, let the link navigate normally to home
    if (pathname !== '/') {
      return; // Allow default navigation to /#section
    }
    
    // If we're on home page, prevent default and smooth scroll
    e.preventDefault();
    const targetId = href.replace('/#', '').replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const navHeight = 100; // Adjust for sticky navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update URL without triggering navigation
      window.history.pushState(null, '', `/#${targetId}`);
    }
  };

  return (
    <>
      {/* Promo Banner */}
      <div className="w-full bg-primary-container text-white py-2 flex items-center justify-center gap-2 text-sm z-50 relative font-mono">
        <Zap size={14} />
        <span>New: Automated billing &amp; bandwidth management is now live</span>
        <a 
          href="/#features" 
          onClick={(e) => scrollToSection(e, '/#features')}
          className="underline font-bold hover:text-primary transition-colors ml-1"
        >
          Learn More
        </a>
      </div>

      {/* Navigation */}
      <nav className="bg-surface-container-highest/80 backdrop-blur-xl sticky top-0 border-b border-outline-variant shadow-sm flex justify-between items-center w-full px-8 h-16 z-40">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={scrollToTop}
            className="font-grotesk text-xl font-bold tracking-tight text-primary flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-md bg-primary-container flex items-center justify-center">
              <Router size={18} className="text-white" />
            </div>
            Ultimate ISP
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "Customers", href: "/#customers" },
              { label: "FAQ", href: "/#faq" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="text-on-surface-variant font-medium hover:text-on-surface transition-colors text-sm cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-on-surface hover:text-primary transition-colors flex items-center gap-2 font-mono text-sm px-4 py-2 border border-outline-variant rounded hover:bg-surface-variant"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-primary-container text-white px-5 py-2 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2 neon-glow text-sm"
          >
            <Zap size={14} />
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container-highest border-b border-outline-variant px-6 py-4 z-30 flex flex-col gap-4">
          {[
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/#pricing" },
            { label: "Customers", href: "/#customers" },
            { label: "FAQ", href: "/#faq" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                scrollToSection(e, item.href);
                setMobileOpen(false);
              }}
              className="text-on-surface-variant font-medium hover:text-on-surface transition-colors cursor-pointer"
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant">
            <Link
              href="/login"
              className="text-center py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-variant transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-center py-2 bg-primary-container text-white rounded-lg font-bold"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
