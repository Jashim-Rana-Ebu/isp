// ============================================================
// TypeScript Types for Ultimate ISP Billing System
// ============================================================

export type UserRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "technician"
  | "agent"
  | "collector"
  | "cashier"
  | "customer";

export type CustomerStatus = "active" | "suspended" | "isolated" | "pending" | "terminated";
export type InvoiceStatus = "unpaid" | "paid" | "overdue" | "cancelled" | "partial";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";
export type PaymentGateway = "sslcommerz" | "bkash" | "paybill" | "cash" | "bank_transfer" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "general" | "billing" | "network" | "installation" | "complaint" | "other";

export interface Role {
  id: string;
  name: UserRole;
  display_name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  module: string;
  description: string | null;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
  permission?: Permission;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role_id: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface Company {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  manager: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SubZone {
  id: string;
  zone_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  bandwidth_up: string | null;
  bandwidth_down: string | null;
  promo_price: number | null;
  promo_cycles: number;
  prorate_first_invoice: boolean;
  use_ppn: boolean;
  ppn_percentage: number;
  use_uso: boolean;
  uso_percentage: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string | null;
  client_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  zone_id: string | null;
  sub_zone_id: string | null;
  package_id: string | null;
  company_id: string | null;
  status: CustomerStatus;
  install_date: string | null;
  photo_url: string | null;
  nid_url: string | null;
  ip_address: string | null;
  pppoe_username: string | null;
  pppoe_password: string | null;
  mac_address: string | null;
  onu_serial: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  promo_cycles_used: number;
  balance: number;
  created_at: string;
  updated_at: string;
  // Joined relations
  zone?: Zone;
  sub_zone?: SubZone;
  package?: Package;
  company?: Company;
}

export interface Invoice {
  id: string;
  invoice_number: string | null;
  customer_id: string;
  package_id: string | null;
  period_month: number;
  period_year: number;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
  package?: Package;
}

export interface Payment {
  id: string;
  invoice_id: string | null;
  customer_id: string;
  amount: number;
  gateway: PaymentGateway;
  gateway_transaction_id: string | null;
  gateway_response: Record<string, unknown> | null;
  status: PaymentStatus;
  paid_at: string | null;
  notes: string | null;
  collected_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  invoice?: Invoice;
  customer?: Customer;
}

export interface Ticket {
  id: string;
  ticket_number: string | null;
  customer_id: string;
  subject: string;
  description: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
  assigned_profile?: Profile;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_staff: boolean;
  created_at: string;
  // Joined
  user?: Profile;
}

export interface Staff {
  id: string;
  profile_id: string | null;
  employee_id: string | null;
  department: string | null;
  designation: string | null;
  salary: number | null;
  join_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  profile?: Profile;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit_price: number;
  serial_number: string | null;
  location: string | null;
  status: "available" | "in_use" | "damaged" | "retired";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  type: "string" | "number" | "boolean" | "json";
  category: string;
  description: string | null;
  updated_at: string;
}

export interface DashboardStats {
  total_customers: number;
  active_customers: number;
  suspended_customers: number;
  pending_customers: number;
  total_revenue_this_month: number;
  unpaid_invoices: number;
  unpaid_amount: number;
  overdue_invoices: number;
  open_tickets: number;
  new_customers_this_month: number;
}

// Permission module groups for the UI
export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { key: "customers", label: "Customers", icon: "Users" },
  { key: "packages", label: "Packages", icon: "Package" },
  { key: "billing", label: "Billing", icon: "FileText" },
  { key: "payments", label: "Payments", icon: "CreditCard" },
  { key: "tickets", label: "Tickets", icon: "MessageSquare" },
  { key: "reports", label: "Reports", icon: "BarChart2" },
  { key: "staff", label: "Staff", icon: "UserCog" },
  { key: "roles", label: "Roles & Permissions", icon: "Shield" },
  { key: "settings", label: "Settings", icon: "Settings" },
  { key: "inventory", label: "Inventory", icon: "Box" },
  { key: "network", label: "Network", icon: "Wifi" },
  { key: "audit", label: "Audit Logs", icon: "FileSearch" },
] as const;
