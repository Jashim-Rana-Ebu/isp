"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Shield,
} from "lucide-react";

const PAGE_SIZE = 20;

type StaffProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  role?: { name: string; display_name: string } | null;
  staff?: {
    employee_id: string | null;
    department: string | null;
    designation: string | null;
    salary: number | null;
    join_date: string | null;
    is_active: boolean;
  } | null;
};

const DEPARTMENTS = [
  "Management",
  "Technical",
  "Billing",
  "Sales",
  "Customer Support",
  "Field Operations",
  "Finance",
  "Administration",
];

const roleColors: Record<string, string> = {
  super_admin: "text-tertiary bg-tertiary/10",
  admin: "text-primary bg-primary/10",
  manager: "text-primary-fixed bg-primary-fixed/10",
  technician: "text-status-latency bg-status-latency/10",
  agent: "text-status-optimal bg-status-optimal/10",
  collector: "text-on-surface-variant bg-on-surface-variant/10",
  cashier: "text-on-surface-variant bg-on-surface-variant/10",
};

export default function StaffPage() {
  const supabase = createClient();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string; display_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select(
        "*, role:roles(name, display_name), staff(*)",
        { count: "exact" }
      )
      .not("role.name", "eq", "customer")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, count } = await query;
    // Filter out customer roles client-side as a fallback
    const filtered = (data ?? []).filter(
      (p: StaffProfile) => p.role?.name !== "customer"
    );
    setStaff(filtered);
    setTotal(count ?? filtered.length);
    setLoading(false);
  }, [page, search, roleFilter]);

  const fetchRoles = useCallback(async () => {
    const { data } = await supabase
      .from("roles")
      .select("id, name, display_name")
      .not("name", "eq", "customer")
      .order("name");
    setRoles(data ?? []);
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, [fetchStaff, fetchRoles]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase
      .from("profiles")
      .update({ is_active: !current })
      .eq("id", id);
    fetchStaff();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const activeCount = staff.filter((s) => s.is_active).length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <UserCog size={28} className="text-primary" /> Staff Management
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage your ISP team &amp; staff accounts
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setShowModal(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL STAFF", value: String(total), color: "text-primary" },
          { label: "ACTIVE", value: String(activeCount), color: "text-status-optimal" },
          {
            label: "INACTIVE",
            value: String(total - activeCount),
            color: "text-status-outage",
          },
          {
            label: "ROLES",
            value: String(roles.length),
            color: "text-tertiary",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-surface-card border border-border-muted rounded-xl p-4"
          >
            <div className="font-mono text-[9px] tracking-widest text-on-surface-variant font-bold mb-2">
              {label}
            </div>
            <div className={`font-mono text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-card border border-border-muted rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="form-input-dark pl-9 text-sm w-full"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(0);
          }}
          className="form-input-dark text-sm w-auto min-w-[150px]"
        >
          <option value="all">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.display_name}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-on-surface-variant flex items-center">
          {total} members
        </span>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center text-on-surface-variant">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading staff...
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-surface-card border border-border-muted rounded-xl p-12 text-center">
          <UserCog size={40} className="text-border-muted mx-auto mb-3" />
          <h3 className="font-grotesk font-semibold text-on-surface-variant mb-1">
            No Staff Found
          </h3>
          <p className="text-sm text-on-surface-variant/70">
            Staff accounts are created from the demo users or by adding new users
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((member) => {
            const roleName = member.role?.name ?? "unknown";
            const roleBadge = roleColors[roleName] ?? "text-on-surface-variant bg-on-surface-variant/10";

            return (
              <div
                key={member.id}
                className={`bg-surface-card border rounded-xl p-5 transition-colors ${
                  member.is_active
                    ? "border-border-muted"
                    : "border-border-muted/40 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base ${
                        member.is_active
                          ? "bg-primary-container"
                          : "bg-surface-container"
                      }`}
                    >
                      {member.full_name?.[0]?.toUpperCase() ??
                        member.email?.[0]?.toUpperCase() ??
                        "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {member.full_name ?? "Unknown"}
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${roleBadge}`}
                      >
                        {member.role?.display_name ?? "No Role"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(member.id, member.is_active)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      member.is_active
                        ? "text-status-optimal hover:bg-status-optimal/10"
                        : "text-status-outage hover:bg-status-outage/10"
                    }`}
                    title={member.is_active ? "Deactivate" : "Activate"}
                  >
                    {member.is_active ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  {member.email && (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Mail size={12} />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Phone size={12} />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.staff?.department && (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Shield size={12} />
                      <span>
                        {member.staff.designation ?? ""}
                        {member.staff.designation && member.staff.department
                          ? " · "
                          : ""}
                        {member.staff.department}
                      </span>
                    </div>
                  )}
                </div>

                {member.staff?.salary && (
                  <div className="mt-3 pt-3 border-t border-border-muted/50 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      SALARY
                    </span>
                    <span className="font-mono text-sm font-bold text-status-optimal">
                      ৳{Number(member.staff.salary).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-border-muted/50 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-on-surface-variant">
                    JOINED {member.staff?.join_date
                      ? new Date(member.staff.join_date).toLocaleDateString()
                      : new Date(member.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingStaff(member);
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="font-mono text-xs text-on-surface-variant">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-sm bg-surface-card border border-border-muted disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-sm bg-surface-card border border-border-muted disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Staff Edit Modal */}
      {showModal && (
        <StaffEditModal
          member={editingStaff}
          roles={roles}
          onClose={() => setShowModal(false)}
          onSave={fetchStaff}
        />
      )}
    </div>
  );
}

// ─── Staff Edit Modal ─────────────────────────────────────────────────────────

function StaffEditModal({
  member,
  roles,
  onClose,
  onSave,
}: {
  member: StaffProfile | null;
  roles: { id: string; name: string; display_name: string }[];
  onClose: () => void;
  onSave: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    full_name: member?.full_name ?? "",
    phone: member?.phone ?? "",
    role_id: "",
    department: member?.staff?.department ?? "",
    designation: member?.staff?.designation ?? "",
    salary: member?.staff?.salary ?? 0,
    join_date: member?.staff?.join_date ?? "",
    employee_id: member?.staff?.employee_id ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member && roles.length > 0) {
      const roleId = roles.find((r) => r.name === member.role?.name)?.id ?? "";
      setForm((prev) => ({ ...prev, role_id: roleId }));
    }
  }, [member, roles]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setSaving(true);

    // Update profile
    await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        role_id: form.role_id || undefined,
      })
      .eq("id", member.id);

    // Upsert staff record
    if (member.staff) {
      await supabase
        .from("staff")
        .update({
          department: form.department,
          designation: form.designation,
          salary: Number(form.salary),
          join_date: form.join_date || null,
          employee_id: form.employee_id,
        })
        .eq("profile_id", member.id);
    } else {
      await supabase.from("staff").insert({
        profile_id: member.id,
        department: form.department,
        designation: form.designation,
        salary: Number(form.salary),
        join_date: form.join_date || null,
        employee_id: form.employee_id,
      });
    }

    setSaving(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-muted rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-muted">
          <h2 className="font-grotesk font-bold text-lg">
            {member ? `Edit: ${member.full_name}` : "Edit Staff"}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-on-surface-variant">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Full Name
              </label>
              <input
                className="form-input-dark text-sm w-full"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Phone
              </label>
              <input
                className="form-input-dark text-sm w-full"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Employee ID
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="EMP-001"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Role
              </label>
              <select
                className="form-input-dark text-sm w-full"
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
              >
                <option value="">— Select Role —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Department
              </label>
              <select
                className="form-input-dark text-sm w-full"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="">— Select —</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Designation
              </label>
              <input
                className="form-input-dark text-sm w-full"
                placeholder="e.g. Senior Tech"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Salary (৳)
              </label>
              <input
                type="number"
                min={0}
                className="form-input-dark text-sm w-full"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Join Date
              </label>
              <input
                type="date"
                className="form-input-dark text-sm w-full"
                value={form.join_date}
                onChange={(e) => setForm({ ...form, join_date: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !member}
            className="btn-primary text-sm py-2.5 w-full disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
