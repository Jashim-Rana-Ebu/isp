import { getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();

  if (!auth) {
    redirect("/login");
  }

  const user = {
    email: auth.profile?.email ?? auth.user.email ?? null,
    full_name: auth.profile?.full_name ?? null,
    role_name: auth.profile?.role?.display_name ?? auth.profile?.role?.name ?? null,
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
