"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Router,
  LayoutDashboard,
  Users,
  Package,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart2,
  UserCog,
  Shield,
  Settings,
  Box,
  Wifi,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Customers", href: "/dashboard/customers" },
  { icon: Package, label: "Packages", href: "/dashboard/packages" },
  { icon: FileText, label: "Billing", href: "/dashboard/billing" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: MessageSquare, label: "Tickets", href: "/dashboard/tickets" },
  { icon: BarChart2, label: "Reports", href: "/dashboard/reports" },
  { icon: Wifi, label: "Network", href: "/dashboard/network" },
  { icon: Box, label: "Inventory", href: "/dashboard/inventory" },
  { icon: UserCog, label: "Staff", href: "/dashboard/staff" },
  { icon: Shield, label: "Roles", href: "/dashboard/roles" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

interface SidebarProps {
  user: {
    email?: string | null;
    full_name?: string | null;
    role_name?: string | null;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link
        href="/dashboard"
        className={`flex items-center gap-2 mb-8 px-2 ${collapsed ? "justify-center" : ""}`}
      >
        <div className="w-8 h-8 rounded-md bg-primary-container flex items-center justify-center flex-shrink-0">
          <Router size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-grotesk text-lg font-bold text-on-surface whitespace-nowrap">
            Ultimate ISP
          </span>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              collapsed ? "justify-center" : ""
            } ${
              isActive(href)
                ? "bg-primary-container/20 text-primary border border-primary-container/30"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-border-muted pt-4 mt-4">
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user.full_name ?? user.email ?? "Admin"}
              </div>
              <div className="font-mono text-xs text-on-surface-variant capitalize">
                {user.role_name?.replace("_", " ") ?? "User"}
              </div>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold">
              {user.full_name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        )}
        <Link
          href="/api/auth/signout"
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={16} />
          {!collapsed && "Sign Out"}
        </Link>
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-full mt-3 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-surface-container border border-border-muted flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-border-muted p-4 z-40 flex flex-col transition-transform duration-300 w-64 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-surface-container-lowest border-r border-border-muted p-4 fixed h-full z-20 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
