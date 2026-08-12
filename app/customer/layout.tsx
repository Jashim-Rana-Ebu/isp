import { getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CustomerSidebar from "@/components/dashboard/CustomerSidebar";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();

  if (!auth) {
    redirect("/login");
  }

  // Redirect admin users away from customer portal
  const roleName = auth.profile?.role?.name ?? "customer";
  if (roleName !== "customer") {
    redirect("/dashboard");
  }

  // Pass user details to sidebar
  const userProps = {
    email: auth.profile?.email ?? auth.user.email,
    full_name: auth.profile?.full_name,
    // Note: To get client_id we'd need to fetch from customers table, 
    // but for layout purposes this basic info is fine.
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Background Grid & Glow (Reused from landing page styling) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-tertiary rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
      </div>

      <div className="z-10 w-full flex">
        <CustomerSidebar user={userProps} />
        <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
