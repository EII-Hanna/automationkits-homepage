import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").select("id").limit(1);

    if (error) {
      return NextResponse.json({ ok: false, service: "automationkits", database: "error" }, { status: 503 });
    }

    return NextResponse.json({ ok: true, service: "automationkits", database: "connected" });
  } catch {
    return NextResponse.json({ ok: false, service: "automationkits", database: "unreachable" }, { status: 503 });
  }
}
