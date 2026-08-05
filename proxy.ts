import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_CANDIDATE = ["/dashboard", "/interview", "/reports", "/mentors", "/analytics", "/profile", "/referrals", "/sessions", "/settings", "/subscription", "/help"];
// PUBLIC routes that must never be protected (no auth check)
const PUBLIC_ROUTES = ["/mentors-public", "/companies", "/login", "/signup", "/"];

const PROTECTED_MENTOR = [
  "/mentor/dashboard",
  "/mentor/sessions",
  "/mentor/availability",
  "/mentor/earnings",
  "/mentor/profile",
  "/mentor/settings",
];
const PROTECTED_ADMIN = ["/admin"];

// A route prefix must end at a path boundary. Without this, `/mentors` also
// matches `/mentor` and candidates get incorrectly redirected to `/dashboard`.
function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Redirect unauthenticated users from protected routes
  // Public routes are always allowed
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isProtected =
    !isPublic && (
      matchesRoute(pathname, PROTECTED_CANDIDATE) ||
      matchesRoute(pathname, PROTECTED_MENTOR) ||
      matchesRoute(pathname, PROTECTED_ADMIN)
    );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }


  // ── Redirect logged-in users away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "candidate";
    const redirectPath =
      role === "admin" ? "/admin/dashboard" :
      role === "mentor" ? "/mentor/dashboard" :
      "/dashboard";

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // ── Role-based access control
  if (user && matchesRoute(pathname, PROTECTED_ADMIN)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (user && matchesRoute(pathname, PROTECTED_MENTOR)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "mentor" && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
