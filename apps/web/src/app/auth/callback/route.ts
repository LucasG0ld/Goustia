import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeReturn(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/compte";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeReturn(url.searchParams.get("retour")), url.origin),
      );
  }
  return NextResponse.redirect(new URL("/auth/erreur", url.origin));
}
