"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Zap
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/customer/dashboard" },
  { icon: FileText, label: "My Bills", href: "/customer/invoices" },
  { icon: MessageSquare, label: "Support Tickets", href: "/customer/tickets" },
  { icon: User, label: "My Profile", href: "/customer/profile" },
];

export default function CustomerSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <Link href="/customer/dashboard" className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 rounded-md bg-primary-container flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-grotesk text-lg font-bold text-on-surface">Client Portal</span>
      </Link>

      <div className="px-2 mb-6 border-b border-border-muted pb-6">
        <div className="text-sm font-medium truncate">{user?.full_name ?? user?.email ?? "Customer"}</div>
        <div className="font-mono text-[10px] text-on-surface-variant">
          CLIENT ID: {user?.client_id ?? "PENDING"}
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-container/15 text-primary border border-primary-container/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </Link>
      </div>
    </>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-container border border-border-muted"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-surface-container-lowest border-r border-border-muted p-6 flex flex-col z-50 transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
