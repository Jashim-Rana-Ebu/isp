import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: Write cookies into the request (for downstream middleware)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: Create a fresh response that carries the updated request cookies
          supabaseResponse = NextResponse.next({ request });
          // Step 3: Write cookies into the response (so browser receives them)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected admin routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has admin-level role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();

    const roleName = (profile?.role as unknown as { name: string } | null)?.name;
    const adminRoles = ["super_admin", "admin", "manager", "technician", "agent", "collector", "cashier"];

    if (!roleName || !adminRoles.includes(roleName)) {
      // If they're a customer, redirect to customer portal
      if (roleName === "customer") {
        const url = request.nextUrl.clone();
        url.pathname = "/customer/dashboard";
        return NextResponse.redirect(url);
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Protected customer routes
  if (pathname.startsWith("/customer")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/register
  if ((pathname === "/login" || pathname === "/register") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();

    const roleName = (profile?.role as unknown as { name: string } | null)?.name;
    const url = request.nextUrl.clone();

    if (roleName === "customer") {
      url.pathname = "/customer/dashboard";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customer/:path*",
    "/login",
    "/register",
  ],
};
