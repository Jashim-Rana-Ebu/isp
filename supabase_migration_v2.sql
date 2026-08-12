-- ============================================================
-- ULTIMATE ISP BILLING SYSTEM — Migration v2
-- Network Management: Mikrotik, OLT, ONU Assignments
-- ============================================================
-- Run this in your Supabase SQL Editor AFTER the v1 migration
-- ============================================================

-- ============================================================
-- 1. MIKROTIK DEVICES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mikrotik_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  port INTEGER DEFAULT 8728,
  username TEXT NOT NULL DEFAULT 'admin',
  password TEXT DEFAULT '',
  api_ssl BOOLEAN DEFAULT false,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ,
  last_status TEXT DEFAULT 'unknown' CHECK (last_status IN ('online', 'offline', 'unknown', 'error')),
  router_board TEXT,         -- e.g. "RB951Ui-2HnD"
  ros_version TEXT,          -- e.g. "6.49.6"
  uptime TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. OLT DEVICES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.olt_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  snmp_port INTEGER DEFAULT 161,
  snmp_community TEXT NOT NULL DEFAULT 'public',
  snmp_version TEXT DEFAULT 'v2c' CHECK (snmp_version IN ('v1', 'v2c', 'v3')),
  profile_type TEXT NOT NULL DEFAULT 'HIOSO_C' 
    CHECK (profile_type IN ('HIOSO_C', 'HIOSO_B2', 'HIOSO_VX', 'HIOSO_B', 'HIOSO_GPON', 'CUSTOM')),
  pon_port_count INTEGER DEFAULT 4,
  telnet_enabled BOOLEAN DEFAULT false,
  telnet_port INTEGER DEFAULT 23,
  telnet_username TEXT,
  telnet_password TEXT,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ,
  last_status TEXT DEFAULT 'unknown' CHECK (last_status IN ('online', 'offline', 'unknown', 'error')),
  firmware TEXT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. ONU ASSIGNMENTS (link ONU serial to customer)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.onu_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  olt_device_id UUID NOT NULL REFERENCES public.olt_devices(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  onu_serial TEXT NOT NULL,
  pon_port INTEGER,
  onu_id INTEGER,
  onu_name TEXT,
  mac_address TEXT,
  -- Latest signal readings (updated by polling)
  rx_power NUMERIC(6,2),      -- dBm
  tx_power NUMERIC(6,2),      -- dBm
  distance INTEGER,           -- meters
  temperature NUMERIC(5,1),   -- °C
  onu_status TEXT DEFAULT 'unknown' CHECK (onu_status IN ('online', 'offline', 'unknown')),
  last_polled TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(olt_device_id, onu_serial)
);

-- ============================================================
-- 4. NETWORK EVENTS LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.network_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_type TEXT NOT NULL CHECK (device_type IN ('mikrotik', 'olt', 'onu')),
  device_id UUID,
  event_type TEXT NOT NULL,   -- e.g. 'status_change', 'pppoe_disconnect', 'snmp_poll'
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  details JSONB,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_mikrotik_devices_active ON public.mikrotik_devices(is_active);
CREATE INDEX IF NOT EXISTS idx_olt_devices_active ON public.olt_devices(is_active);
CREATE INDEX IF NOT EXISTS idx_onu_assignments_olt ON public.onu_assignments(olt_device_id);
CREATE INDEX IF NOT EXISTS idx_onu_assignments_customer ON public.onu_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_onu_assignments_serial ON public.onu_assignments(onu_serial);
CREATE INDEX IF NOT EXISTS idx_network_events_device ON public.network_events(device_id);
CREATE INDEX IF NOT EXISTS idx_network_events_customer ON public.network_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_network_events_created ON public.network_events(created_at DESC);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.mikrotik_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olt_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onu_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_events ENABLE ROW LEVEL SECURITY;

-- Mikrotik Devices: admin only
CREATE POLICY "Admins can view mikrotik" ON public.mikrotik_devices FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage mikrotik" ON public.mikrotik_devices FOR ALL USING (public.is_admin());

-- OLT Devices: admin only
CREATE POLICY "Admins can view olt" ON public.olt_devices FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage olt" ON public.olt_devices FOR ALL USING (public.is_admin());

-- ONU Assignments: admin only
CREATE POLICY "Admins can view onu" ON public.onu_assignments FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage onu" ON public.onu_assignments FOR ALL USING (public.is_admin());

-- Network Events: admin only
CREATE POLICY "Admins can view events" ON public.network_events FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert events" ON public.network_events FOR INSERT WITH CHECK (true);

-- ============================================================
-- 7. NEW PERMISSIONS for Network Management
-- ============================================================

INSERT INTO public.permissions (name, display_name, module) VALUES
  ('mikrotik.view', 'View Mikrotik Devices', 'network'),
  ('mikrotik.manage', 'Manage Mikrotik Devices', 'network'),
  ('olt.view', 'View OLT Devices', 'network'),
  ('olt.manage', 'Manage OLT Devices', 'network')
ON CONFLICT (name) DO NOTHING;

-- Grant new permissions to super_admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'super_admin'
  AND p.name IN ('mikrotik.view', 'mikrotik.manage', 'olt.view', 'olt.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant to admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('admin', 'manager', 'technician')
  AND p.name IN ('mikrotik.view', 'olt.view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 8. NEW SETTINGS for Mikrotik / OLT / PayBill
-- ============================================================

INSERT INTO public.settings (key, value, type, category, description) VALUES
  ('mikrotik_default_port', '8728', 'number', 'network', 'Default Mikrotik API port'),
  ('olt_snmp_timeout', '5000', 'number', 'network', 'OLT SNMP timeout in ms'),
  ('network_poll_interval', '300', 'number', 'network', 'Network device poll interval in seconds'),
  ('paybill_merchant_id', '', 'string', 'payment', 'PayBill Merchant ID'),
  ('paybill_callback_url', '', 'string', 'payment', 'PayBill Callback URL')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 9. FUNCTION: Get monthly revenue for charts
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_monthly_revenue(months_back INTEGER DEFAULT 12)
RETURNS TABLE(month_label TEXT, revenue NUMERIC, invoice_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', generate_series), 'Mon YYYY') AS month_label,
    COALESCE(SUM(p.amount), 0) AS revenue,
    COUNT(p.id) AS invoice_count
  FROM generate_series(
    DATE_TRUNC('month', NOW() - INTERVAL '1 month' * (months_back - 1)),
    DATE_TRUNC('month', NOW()),
    '1 month'
  )
  LEFT JOIN public.payments p ON
    DATE_TRUNC('month', p.paid_at) = generate_series
    AND p.status = 'completed'
  GROUP BY generate_series
  ORDER BY generate_series;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. FUNCTION: Get payment gateway breakdown
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_payment_gateway_stats()
RETURNS TABLE(gateway TEXT, total_amount NUMERIC, transaction_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.gateway,
    COALESCE(SUM(p.amount), 0) AS total_amount,
    COUNT(p.id) AS transaction_count
  FROM public.payments p
  WHERE p.status = 'completed'
    AND p.paid_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
  GROUP BY p.gateway
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
