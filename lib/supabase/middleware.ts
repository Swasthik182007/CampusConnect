import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("your-anon-key")
  ) {
    // If Supabase is not configured yet, allow request to proceed (demo mode)
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  // Refresh auth token and verify session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/marketplace/new") ||
    pathname.startsWith("/events/new") ||
    pathname.startsWith("/projects/new") ||
    pathname.startsWith("/tutoring/become-a-tutor") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/profile");

  // 1. Unauthenticated users accessing protected routes
  if (!user || authError) {
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 2. Fetch profile from public.profiles for role verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed, is_verified, is_suspended")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "student";
  const isSuspended = profile?.is_suspended ?? false;

  // Suspended account check
  if (isSuspended) {
    await supabase.auth.signOut();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "account_suspended");
    return NextResponse.redirect(loginUrl);
  }

  // Prevent authenticated users from opening login / signup again
  if (pathname === "/login" || pathname === "/signup") {
    if (role === "admin" || role === "moderator") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const target = profile?.onboarding_completed ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Protect /admin routes against non-administrators
  if (pathname.startsWith("/admin")) {
    if (role !== "admin" && role !== "moderator") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Handle student routes and onboarding flow
  if (role === "student") {
    const isStudentPage =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/events") ||
      pathname.startsWith("/tutoring") ||
      pathname.startsWith("/communities") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/notifications") ||
      pathname.startsWith("/profile");

    if (!profile?.onboarding_completed && isStudentPage) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (profile?.onboarding_completed && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
