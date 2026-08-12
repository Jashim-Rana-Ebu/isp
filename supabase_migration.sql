-- ============================================================
-- ULTIMATE ISP BILLING SYSTEM — Complete Supabase Migration
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ROLES & PERMISSIONS
-- ============================================================

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- system roles can't be deleted
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,        -- e.g. 'customers.view', 'billing.create'
  display_name TEXT NOT NULL,
  module TEXT NOT NULL,              -- e.g. 'customers', 'billing', 'settings'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- ============================================================
-- 2. USER PROFILES
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role_id UUID REFERENCES public.roles(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. COMPANY & LOCATION
-- ============================================================

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  manager TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sub_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. INTERNET PACKAGES
-- ============================================================

CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  bandwidth_up TEXT,         -- e.g. '10M'
  bandwidth_down TEXT,       -- e.g. '50M'
  promo_price NUMERIC(12,2),
  promo_cycles INTEGER DEFAULT 0,
  prorate_first_invoice BOOLEAN DEFAULT false,
  use_ppn BOOLEAN DEFAULT false,
  ppn_percentage NUMERIC(5,2) DEFAULT 11.00,
  use_uso BOOLEAN DEFAULT false,
  uso_percentage NUMERIC(5,2) DEFAULT 1.50,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. CUSTOMERS
-- ============================================================

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- linked Supabase auth user
  client_id TEXT UNIQUE,             -- e.g. CLT-0001
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  zone_id UUID REFERENCES public.zones(id),
  sub_zone_id UUID REFERENCES public.sub_zones(id),
  package_id UUID REFERENCES public.packages(id),
  company_id UUID REFERENCES public.companies(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'isolated', 'pending', 'terminated')),
  install_date DATE,
  photo_url TEXT,
  nid_url TEXT,
  ip_address TEXT,
  pppoe_username TEXT,
  pppoe_password TEXT,
  mac_address TEXT,
  onu_serial TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  notes TEXT,
  promo_cycles_used INTEGER DEFAULT 0,
  balance NUMERIC(12,2) DEFAULT 0,   -- prepaid balance
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate client_id
CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(client_id FROM 5) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM public.customers
  WHERE client_id ~ '^CLT-[0-9]+$';

  NEW.client_id := 'CLT-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_client_id
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  WHEN (NEW.client_id IS NULL)
  EXECUTE FUNCTION generate_client_id();

-- ============================================================
-- 6. INVOICES & BILLING
-- ============================================================

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id),
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled', 'partial')),
  due_date DATE,
  paid_date TIMESTAMPTZ,
  notes TEXT,
  meta JSONB,  -- promo info, prorata details, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM public.invoices
  WHERE invoice_number ~ '^INV-[0-9]+$';

  NEW.invoice_number := 'INV-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- ============================================================
-- 7. PAYMENTS
-- ============================================================

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  gateway TEXT NOT NULL CHECK (gateway IN ('sslcommerz', 'bkash', 'paybill', 'cash', 'bank_transfer', 'other')),
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  collected_by UUID REFERENCES public.profiles(id),   -- for cash collections
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. SUPPORT TICKETS
-- ============================================================

CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'billing', 'network', 'installation', 'complaint', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM public.tickets
  WHERE ticket_number ~ '^TKT-[0-9]+$';

  NEW.ticket_number := 'TKT-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. STAFF MANAGEMENT
-- ============================================================

CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  department TEXT,
  designation TEXT,
  salary NUMERIC(12,2),
  join_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. INVENTORY
-- ============================================================

CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  unit_price NUMERIC(12,2) DEFAULT 0,
  serial_number TEXT,
  location TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'damaged', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 11. AUDIT LOGS
-- ============================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 12. SYSTEM SETTINGS
-- ============================================================

CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  category TEXT DEFAULT 'general',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 13. DEMO REQUESTS & CLIENT REGISTRATIONS (Landing Page)
-- ============================================================

CREATE TABLE public.demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subscriber_range TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.client_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  package TEXT,
  address TEXT,
  zone TEXT,
  subzone TEXT,
  photo_url TEXT,
  nid_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEED DATA: Default Roles
-- ============================================================

INSERT INTO public.roles (name, display_name, description, is_system) VALUES
  ('super_admin', 'Super Admin', 'Full system access with all permissions', true),
  ('admin', 'Admin', 'Administrative access to manage the system', true),
  ('manager', 'Manager', 'Branch/company management access', true),
  ('technician', 'Technician', 'Field technician with network access', true),
  ('agent', 'Agent', 'Sales agent with customer management', true),
  ('collector', 'Collector', 'Payment collector with billing access', true),
  ('cashier', 'Cashier', 'Cashier with payment processing access', true),
  ('customer', 'Customer', 'Customer self-service portal access', true);

-- ============================================================
-- SEED DATA: Default Permissions
-- ============================================================

INSERT INTO public.permissions (name, display_name, module) VALUES
  -- Dashboard
  ('dashboard.view', 'View Dashboard', 'dashboard'),
  ('dashboard.analytics', 'View Analytics', 'dashboard'),
  -- Customers
  ('customers.view', 'View Customers', 'customers'),
  ('customers.create', 'Create Customer', 'customers'),
  ('customers.edit', 'Edit Customer', 'customers'),
  ('customers.delete', 'Delete Customer', 'customers'),
  ('customers.suspend', 'Suspend/Activate Customer', 'customers'),
  ('customers.export', 'Export Customer Data', 'customers'),
  -- Packages
  ('packages.view', 'View Packages', 'packages'),
  ('packages.create', 'Create Package', 'packages'),
  ('packages.edit', 'Edit Package', 'packages'),
  ('packages.delete', 'Delete Package', 'packages'),
  -- Billing
  ('billing.view', 'View Invoices', 'billing'),
  ('billing.create', 'Generate Invoices', 'billing'),
  ('billing.edit', 'Edit Invoice', 'billing'),
  ('billing.delete', 'Delete Invoice', 'billing'),
  ('billing.print', 'Print Invoice', 'billing'),
  -- Payments
  ('payments.view', 'View Payments', 'payments'),
  ('payments.create', 'Record Payment', 'payments'),
  ('payments.refund', 'Process Refund', 'payments'),
  -- Tickets
  ('tickets.view', 'View Tickets', 'tickets'),
  ('tickets.create', 'Create Ticket', 'tickets'),
  ('tickets.assign', 'Assign Ticket', 'tickets'),
  ('tickets.resolve', 'Resolve Ticket', 'tickets'),
  -- Reports
  ('reports.view', 'View Reports', 'reports'),
  ('reports.export', 'Export Reports', 'reports'),
  -- Staff
  ('staff.view', 'View Staff', 'staff'),
  ('staff.create', 'Add Staff', 'staff'),
  ('staff.edit', 'Edit Staff', 'staff'),
  ('staff.delete', 'Remove Staff', 'staff'),
  -- Roles & Permissions
  ('roles.view', 'View Roles', 'roles'),
  ('roles.create', 'Create Role', 'roles'),
  ('roles.edit', 'Edit Role Permissions', 'roles'),
  ('roles.delete', 'Delete Role', 'roles'),
  -- Settings
  ('settings.view', 'View Settings', 'settings'),
  ('settings.edit', 'Edit Settings', 'settings'),
  -- Inventory
  ('inventory.view', 'View Inventory', 'inventory'),
  ('inventory.create', 'Add Inventory', 'inventory'),
  ('inventory.edit', 'Edit Inventory', 'inventory'),
  ('inventory.delete', 'Delete Inventory', 'inventory'),
  -- Network
  ('network.view', 'View Network Status', 'network'),
  ('network.manage', 'Manage Network Devices', 'network'),
  -- Audit Logs
  ('audit.view', 'View Audit Logs', 'audit');

-- ============================================================
-- SEED DATA: Super Admin gets ALL permissions
-- ============================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'super_admin';

-- Admin gets all except role management
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
  AND p.name NOT IN ('roles.create', 'roles.delete');

-- Manager gets customer, billing, payments, tickets, reports, staff view
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'manager'
  AND p.module IN ('dashboard', 'customers', 'billing', 'payments', 'tickets', 'reports', 'packages')
  AND p.name NOT LIKE '%.delete';

-- Technician gets network + tickets + customer view
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'technician'
  AND (p.module IN ('network', 'tickets') OR p.name IN ('dashboard.view', 'customers.view'));

-- Agent gets customer management + packages view
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'agent'
  AND (p.module = 'customers' OR p.name IN ('dashboard.view', 'packages.view', 'tickets.view', 'tickets.create'));

-- Collector gets billing + payment access
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'collector'
  AND (p.module IN ('billing', 'payments') OR p.name IN ('dashboard.view', 'customers.view'));

-- Cashier gets payment processing
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'cashier'
  AND (p.module = 'payments' OR p.name IN ('dashboard.view', 'billing.view', 'customers.view'));

-- ============================================================
-- SEED DATA: Default Settings
-- ============================================================

INSERT INTO public.settings (key, value, type, category, description) VALUES
  ('company_name', 'Ultimate ISP', 'string', 'company', 'Company display name'),
  ('company_address', 'Bandar Shahi Mosjid, Narayanganj 1410', 'string', 'company', 'Company address'),
  ('company_phone', '01722625256', 'string', 'company', 'Company phone number'),
  ('company_email', 'isp@gmail.com', 'string', 'company', 'Company email'),
  ('isolir_day', '20', 'number', 'billing', 'Day of month to isolate unpaid customers'),
  ('invoice_due_days', '15', 'number', 'billing', 'Days after invoice generation before due'),
  ('currency_symbol', '৳', 'string', 'billing', 'Currency symbol'),
  ('currency_code', 'BDT', 'string', 'billing', 'Currency code'),
  ('sslcommerz_store_id', '', 'string', 'payment', 'SSLCommerz Store ID'),
  ('sslcommerz_store_password', '', 'string', 'payment', 'SSLCommerz Store Password'),
  ('sslcommerz_sandbox', 'true', 'boolean', 'payment', 'SSLCommerz sandbox mode'),
  ('bkash_app_key', '', 'string', 'payment', 'bKash App Key'),
  ('bkash_app_secret', '', 'string', 'payment', 'bKash App Secret'),
  ('bkash_username', '', 'string', 'payment', 'bKash Username'),
  ('bkash_password', '', 'string', 'payment', 'bKash Password'),
  ('bkash_sandbox', 'true', 'boolean', 'payment', 'bKash sandbox mode'),
  ('paybill_api_key', '', 'string', 'payment', 'PayBill API Key'),
  ('paybill_secret', '', 'string', 'payment', 'PayBill Secret Key'),
  ('paybill_sandbox', 'true', 'boolean', 'payment', 'PayBill sandbox mode');

-- ============================================================
-- SEED DATA: Default Packages
-- ============================================================

INSERT INTO public.packages (name, description, price, bandwidth_up, bandwidth_down, is_active, sort_order) VALUES
  ('Starter 10Mbps', 'Perfect for basic browsing and email', 1000, '5M', '10M', true, 1),
  ('Business 50Mbps', 'Ideal for growing businesses', 1500, '25M', '50M', true, 2),
  ('Enterprise 100Mbps', 'For large operations & resellers', 2500, '50M', '100M', true, 3),
  ('Fiber 1Gbps', 'Ultimate speed unlimited data', 3500, '500M', '1G', true, 4);

-- ============================================================
-- SEED DATA: Default Company
-- ============================================================

INSERT INTO public.companies (name, address, phone, email, manager, is_active) VALUES
  ('Ultimate ISP', 'Bandar Shahi Mosjid, Narayanganj 1410', '01722625256', 'isp@gmail.com', 'Ultimate ISP', true);

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_zone ON public.customers(zone_id);
CREATE INDEX idx_customers_package ON public.customers(package_id);
CREATE INDEX idx_customers_client_id ON public.customers(client_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_period ON public.invoices(period_year, period_month);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_tickets_customer ON public.tickets(customer_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_module ON public.audit_logs(module);
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX idx_profiles_role ON public.profiles(role_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_registrations ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin/super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('super_admin', 'admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: check if user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(perm_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role_id = p.role_id
    JOIN public.permissions pm ON pm.id = rp.permission_id
    WHERE p.id = auth.uid()
    AND pm.name = perm_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() = id);

-- Roles: readable by authenticated, writable by admins
CREATE POLICY "Authenticated can read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (public.is_admin());

-- Permissions: readable by authenticated
CREATE POLICY "Authenticated can read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (public.is_admin());

-- Role Permissions: readable by authenticated, writable by admins
CREATE POLICY "Authenticated can read role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_admin());

-- Companies: readable by authenticated, writable by admins
CREATE POLICY "Authenticated can read companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (public.is_admin());

-- Zones/Sub-zones: readable by all (for registration), writable by admins
CREATE POLICY "Anyone can read zones" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage zones" ON public.zones FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can read sub_zones" ON public.sub_zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage sub_zones" ON public.sub_zones FOR ALL USING (public.is_admin());

-- Packages: readable by all, writable by admins
CREATE POLICY "Anyone can read packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage packages" ON public.packages FOR ALL USING (public.is_admin());

-- Customers: admins see all, customers see own
CREATE POLICY "Staff can view all customers" ON public.customers FOR SELECT USING (public.is_admin() OR user_id = auth.uid());
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING (public.is_admin());

-- Invoices: admins see all, customers see own
CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT USING (
  public.is_admin() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (public.is_admin());

-- Payments: admins see all, customers see own
CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT USING (
  public.is_admin() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.is_admin());
CREATE POLICY "Customers can create payments" ON public.payments FOR INSERT WITH CHECK (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);

-- Tickets: admins see all, customers see own
CREATE POLICY "View own or all tickets" ON public.tickets FOR SELECT USING (
  public.is_admin() OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage tickets" ON public.tickets FOR ALL USING (public.is_admin());
CREATE POLICY "Customers can create tickets" ON public.tickets FOR INSERT WITH CHECK (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);

-- Ticket Replies: follow parent ticket access
CREATE POLICY "View ticket replies" ON public.ticket_replies FOR SELECT USING (
  public.is_admin() OR ticket_id IN (
    SELECT t.id FROM public.tickets t
    JOIN public.customers c ON t.customer_id = c.id
    WHERE c.user_id = auth.uid()
  )
);
CREATE POLICY "Staff can reply" ON public.ticket_replies FOR INSERT WITH CHECK (public.is_admin() OR NOT is_staff);

-- Staff: admin only
CREATE POLICY "Admins can view staff" ON public.staff FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL USING (public.is_admin());

-- Inventory: admin only
CREATE POLICY "Admins can view inventory" ON public.inventory FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL USING (public.is_admin());

-- Audit Logs: admin only
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Settings: admin only
CREATE POLICY "Admins can view settings" ON public.settings FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.is_admin());

-- Demo Requests: anyone can insert, admins can view
CREATE POLICY "Anyone can submit demo request" ON public.demo_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view demo requests" ON public.demo_requests FOR SELECT USING (public.is_admin());

-- Client Registrations: anyone can insert, admins can view/manage
CREATE POLICY "Anyone can register" ON public.client_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view registrations" ON public.client_registrations FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage registrations" ON public.client_registrations FOR ALL USING (public.is_admin());

-- ============================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  customer_role_id UUID;
BEGIN
  SELECT id INTO customer_role_id FROM public.roles WHERE name = 'customer' LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    customer_role_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: Get dashboard stats
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_customers', (SELECT COUNT(*) FROM public.customers),
    'active_customers', (SELECT COUNT(*) FROM public.customers WHERE status = 'active'),
    'suspended_customers', (SELECT COUNT(*) FROM public.customers WHERE status = 'suspended'),
    'pending_customers', (SELECT COUNT(*) FROM public.customers WHERE status = 'pending'),
    'total_revenue_this_month', (
      SELECT COALESCE(SUM(amount), 0) FROM public.payments
      WHERE status = 'completed'
      AND EXTRACT(MONTH FROM paid_at) = EXTRACT(MONTH FROM now())
      AND EXTRACT(YEAR FROM paid_at) = EXTRACT(YEAR FROM now())
    ),
    'unpaid_invoices', (SELECT COUNT(*) FROM public.invoices WHERE status = 'unpaid'),
    'unpaid_amount', (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices WHERE status = 'unpaid'),
    'overdue_invoices', (SELECT COUNT(*) FROM public.invoices WHERE status = 'overdue'),
    'open_tickets', (SELECT COUNT(*) FROM public.tickets WHERE status IN ('open', 'in_progress')),
    'new_customers_this_month', (
      SELECT COUNT(*) FROM public.customers
      WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM now())
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now())
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
