import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        // Ensure email is verified in profiles table upon confirmation
        await supabase
          .from("profiles")
          .update({ is_verified: true })
          .eq("id", data.user.id);

        // Fetch role to route to correct dashboard
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin" || profile?.role === "moderator") {
          return NextResponse.redirect(`${origin}/admin`);
        }
        if (profile?.onboarding_completed === false) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to login if exchange fails
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
