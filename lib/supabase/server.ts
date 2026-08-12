import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Profile, Role, Permission } from "@/types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: process.env.NODE_ENV === 'production' ? '.geofury.live' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user with profile and role
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, role:roles(*)")
    .eq("id", user.id)
    .single();

  return { user, profile: profile as (Profile & { role: Role }) | null };
}

/**
 * Get all permissions for the current user
 */
export async function getUserPermissions(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .single();

  if (!profile?.role_id) return [];

  // Check if super_admin — gets everything
  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .single();

  if (role?.name === "super_admin") {
    const { data: allPerms } = await supabase
      .from("permissions")
      .select("name");
    return (allPerms ?? []).map((p) => p.name);
  }

  const { data: rolePerms } = await supabase
    .from("role_permissions")
    .select("permission:permissions(name)")
    .eq("role_id", profile.role_id);

  return (rolePerms ?? []).map(
    (rp) => (rp.permission as unknown as Permission).name
  );
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permissionName: string): Promise<boolean> {
  const permissions = await getUserPermissions();
  return permissions.includes(permissionName);
}

/**
 * Check if current user is admin-level
 */
export async function isAdmin(): Promise<boolean> {
  const auth = await getAuthUser();
  if (!auth?.profile?.role) return false;
  return ["super_admin", "admin", "manager"].includes(auth.profile.role.name);
}
