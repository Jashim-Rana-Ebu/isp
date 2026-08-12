"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Users,
  Lock,
} from "lucide-react";

interface RoleData {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
}

interface PermissionData {
  id: string;
  name: string;
  display_name: string;
  module: string;
}

const MODULE_ICONS: Record<string, string> = {
  dashboard: "📊", customers: "👥", packages: "📦", billing: "📄",
  payments: "💳", tickets: "🎫", reports: "📈", staff: "👤",
  roles: "🛡️", settings: "⚙️", inventory: "📋", network: "🌐", audit: "🔍",
};

export default function RolesPage() {
  const supabase = createClient();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showNewForm, setShowNewForm] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", display_name: "", description: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch all roles
    const { data: rolesData } = await supabase.from("roles").select("*").order("created_at");

    // Fetch all permissions
    const { data: permsData } = await supabase.from("permissions").select("*").order("module, name");

    // Fetch all role_permissions
    const { data: rolePerms } = await supabase.from("role_permissions").select("role_id, permission:permissions(name)");

    // Map permissions to roles
    const rolePermMap = new Map<string, string[]>();
    (rolePerms ?? []).forEach((rp: any) => {
      const rolePerm = rolePermMap.get(rp.role_id) ?? [];
      if (rp.permission?.name) rolePerm.push(rp.permission.name);
      rolePermMap.set(rp.role_id, rolePerm);
    });

    const enrichedRoles: RoleData[] = (rolesData ?? []).map((r: any) => ({
      ...r,
      permissions: rolePermMap.get(r.id) ?? [],
    }));

    setRoles(enrichedRoles);
    setAllPermissions(permsData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce<Record<string, PermissionData[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const startEditRole = (role: RoleData) => {
    setEditingRole(role.id);
    setSelectedPermissions(new Set(role.permissions));
    // Expand all modules that have selected permissions
    const modules = new Set<string>();
    role.permissions.forEach((p) => {
      const mod = p.split(".")[0];
      modules.add(mod);
    });
    setExpandedModules(modules);
  };

  const toggleModule = (mod: string) => {
    const next = new Set(expandedModules);
    if (next.has(mod)) next.delete(mod);
    else next.add(mod);
    setExpandedModules(next);
  };

  const togglePermission = (permName: string) => {
    const next = new Set(selectedPermissions);
    if (next.has(permName)) next.delete(permName);
    else next.add(permName);
    setSelectedPermissions(next);
  };

  const toggleModuleAll = (mod: string) => {
    const modPerms = permissionsByModule[mod]?.map((p) => p.name) ?? [];
    const allSelected = modPerms.every((p) => selectedPermissions.has(p));
    const next = new Set(selectedPermissions);
    modPerms.forEach((p) => {
      if (allSelected) next.delete(p);
      else next.add(p);
    });
    setSelectedPermissions(next);
  };

  const savePermissions = async (roleId: string) => {
    setSaving(true);
    setError(null);
    try {
      // Delete existing permissions for this role
      await supabase.from("role_permissions").delete().eq("role_id", roleId);

      // Get permission IDs for selected permission names
      const selectedNames = Array.from(selectedPermissions);
      if (selectedNames.length > 0) {
        const { data: perms } = await supabase
          .from("permissions")
          .select("id, name")
          .in("name", selectedNames);

        const inserts = (perms ?? []).map((p: any) => ({
          role_id: roleId,
          permission_id: p.id,
        }));

        if (inserts.length > 0) {
          const { error: insertError } = await supabase
            .from("role_permissions")
            .insert(inserts);
          if (insertError) throw insertError;
        }
      }

      setEditingRole(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const slug = newRole.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const { error: createErr } = await supabase.from("roles").insert({
      name: slug,
      display_name: newRole.display_name || newRole.name,
      description: newRole.description || null,
      is_system: false,
    });
    if (createErr) { setError(createErr.message); return; }
    setShowNewForm(false);
    setNewRole({ name: "", display_name: "", description: "" });
    fetchData();
  };

  const deleteRole = async (id: string) => {
    if (!confirm("Delete this role? Users with this role will lose their permissions.")) return;
    await supabase.from("role_permissions").delete().eq("role_id", id);
    await supabase.from("roles").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-grotesk text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield size={28} className="text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Configure access control for your team
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="btn-primary text-sm"
        >
          <Plus size={16} /> Create Role
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/40 text-error text-sm">
          {error}
        </div>
      )}

      {/* New Role Form */}
      {showNewForm && (
        <div className="bg-surface-card border border-primary-container/30 rounded-xl p-6 mb-6">
          <h3 className="font-grotesk font-semibold text-lg mb-4">Create New Role</h3>
          <form onSubmit={createRole} className="flex flex-col md:flex-row gap-4">
            <input
              required
              placeholder="Role slug (e.g. field_officer)"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              className="form-input-dark text-sm flex-1"
            />
            <input
              required
              placeholder="Display Name"
              value={newRole.display_name}
              onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
              className="form-input-dark text-sm flex-1"
            />
            <input
              placeholder="Description (optional)"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              className="form-input-dark text-sm flex-1"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm whitespace-nowrap">
                <Save size={14} /> Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles List */}
      {loading ? (
        <div className="flex justify-center py-12 text-on-surface-variant">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
          Loading roles...
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => {
            const isEditing = editingRole === role.id;
            return (
              <div
                key={role.id}
                className={`bg-surface-card border rounded-xl overflow-hidden transition-all ${
                  isEditing ? "border-primary-container" : "border-border-muted"
                }`}
              >
                {/* Role Header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-container/15 flex items-center justify-center">
                      <Shield size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-grotesk font-semibold">{role.display_name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="font-mono text-[10px] text-on-surface-variant tracking-widest">
                          {role.name}
                        </span>
                        <span className="font-mono text-[10px] text-primary">
                          {role.permissions.length} permissions
                        </span>
                        {role.is_system && (
                          <span className="font-mono text-[10px] bg-primary-container/20 text-primary px-2 py-0.5 rounded-full">
                            SYSTEM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => savePermissions(role.id)}
                          disabled={saving}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          <Save size={14} />
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditRole(role)}
                          className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                          title="Edit Permissions"
                        >
                          <Edit size={16} className="text-on-surface-variant" />
                        </button>
                        {!role.is_system && (
                          <button
                            onClick={() => deleteRole(role.id)}
                            className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                            title="Delete Role"
                          >
                            <Trash2 size={16} className="text-status-outage" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Permission Editor */}
                {isEditing && (
                  <div className="border-t border-border-muted px-5 py-4">
                    <p className="text-sm text-on-surface-variant mb-4">
                      Select which modules and actions this role can access:
                    </p>
                    <div className="space-y-2">
                      {Object.entries(permissionsByModule).map(
                        ([mod, perms]) => {
                          const modPerms = perms.map((p) => p.name);
                          const selectedCount = modPerms.filter((p) =>
                            selectedPermissions.has(p)
                          ).length;
                          const allSelected = selectedCount === modPerms.length;
                          const someSelected = selectedCount > 0 && !allSelected;
                          const isExpanded = expandedModules.has(mod);

                          return (
                            <div
                              key={mod}
                              className="bg-surface-container/50 rounded-lg border border-border-muted/50"
                            >
                              {/* Module Header */}
                              <div className="flex items-center justify-between px-4 py-3">
                                <button
                                  onClick={() => toggleModule(mod)}
                                  className="flex items-center gap-3 flex-1 text-left"
                                >
                                  {isExpanded ? (
                                    <ChevronDown size={14} className="text-on-surface-variant" />
                                  ) : (
                                    <ChevronRight size={14} className="text-on-surface-variant" />
                                  )}
                                  <span className="text-lg">
                                    {MODULE_ICONS[mod] ?? "📁"}
                                  </span>
                                  <span className="font-medium text-sm capitalize">
                                    {mod}
                                  </span>
                                  <span className="font-mono text-[10px] text-on-surface-variant">
                                    {selectedCount}/{modPerms.length}
                                  </span>
                                </button>
                                {/* Select All toggle */}
                                <button
                                  onClick={() => toggleModuleAll(mod)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest transition-colors ${
                                    allSelected
                                      ? "bg-status-optimal/15 text-status-optimal"
                                      : someSelected
                                      ? "bg-status-latency/15 text-status-latency"
                                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                                  }`}
                                >
                                  {allSelected ? "ALL" : someSelected ? "PARTIAL" : "NONE"}
                                </button>
                              </div>

                              {/* Individual Permissions */}
                              {isExpanded && (
                                <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {perms.map((perm) => (
                                    <label
                                      key={perm.id}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                                        selectedPermissions.has(perm.name)
                                          ? "bg-primary-container/15 text-primary border border-primary-container/30"
                                          : "hover:bg-surface-container border border-transparent"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissions.has(perm.name)}
                                        onChange={() => togglePermission(perm.name)}
                                        className="accent-primary-container rounded"
                                      />
                                      <div>
                                        <div className="font-medium text-sm">
                                          {perm.display_name}
                                        </div>
                                        <div className="font-mono text-[10px] text-on-surface-variant">
                                          {perm.name}
                                        </div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Compact Permission Tags (when not editing) */}
                {!isEditing && role.permissions.length > 0 && (
                  <div className="border-t border-border-muted/50 px-5 py-3 flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 8).map((p) => (
                      <span
                        key={p}
                        className="font-mono text-[9px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant"
                      >
                        {p}
                      </span>
                    ))}
                    {role.permissions.length > 8 && (
                      <span className="font-mono text-[9px] bg-primary-container/15 text-primary px-2 py-0.5 rounded-full">
                        +{role.permissions.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
