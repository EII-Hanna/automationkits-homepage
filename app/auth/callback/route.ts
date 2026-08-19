import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_NEXT = new Set(["/internal", "/portal", "/internal/customers", "/internal/onboarding", "/internal/delivery", "/internal/tasks", "/internal/blockers", "/internal/results", "/internal/support", "/internal/activity", "/internal/billing"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") || "/internal";
  const next = ALLOWED_NEXT.has(requestedNext) ? requestedNext : "/internal";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code`, url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const target = new URL("/login", url.origin);
    target.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(target);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
