import Link from "next/link";
import { Router, MapPin, Phone, Mail, Globe, MessageCircle, AtSign, Video } from "lucide-react";

const socials = [
  { icon: Globe, href: "#", label: "Facebook" },
  { icon: MessageCircle, href: "#", label: "Twitter" },
  { icon: AtSign, href: "#", label: "LinkedIn" },
  { icon: Video, href: "#", label: "YouTube" },
];

const productLinks = ["Features", "Pricing", "Customers", "FAQ"];
const quickLinks = [
  { label: "Client Portal", href: "#" },
  { label: "Sign Up", href: "/register" },
  { label: "Request Demo", href: "#demo" },
  { label: "Contact Us", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest pt-12 pb-6 px-8 border-t border-border-muted">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <Link
            href="/"
            className="font-grotesk text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2 mb-4"
          >
            <Router size={28} className="text-primary-container" />
            Ultimate ISP
          </Link>
          <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
            A complete management platform for Internet Service Providers — clients, billing,
            bandwidth, support and growth in one place.
          </p>
          <p className="text-primary-container/80 text-sm italic mb-6">"Nexus Network System"</p>

          {/* Social Links */}
          <div className="flex gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="w-10 h-10 rounded-lg bg-surface-container border border-border-muted flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-primary-container"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-bold mb-6 text-on-surface">Product</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            {productLinks.map((label) => (
              <li key={label}>
                <Link
                  href={`#${label.toLowerCase()}`}
                  className="hover:text-primary-container transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-6 text-on-surface">Quick Links</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            {quickLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="hover:text-primary-container transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold mb-6 text-on-surface">Contact</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-start gap-3 group">
              <MapPin size={18} className="text-primary-container mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="leading-relaxed">Bandar Shahi Mosjid, Narayanganj<br />1410</span>
            </li>
            <li className="flex items-center gap-3 group">
              <Phone size={18} className="text-primary-container group-hover:scale-110 transition-transform flex-shrink-0" />
              <span>01722625256</span>
            </li>
            <li className="flex items-center gap-3 group">
              <Mail size={18} className="text-primary-container group-hover:scale-110 transition-transform flex-shrink-0" />
              <span>isp@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-border-muted flex flex-col md:flex-row justify-between items-center text-sm text-on-surface-variant gap-4">
        <div>© 2026 Ultimate ISP. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-primary-container transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary-container transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
