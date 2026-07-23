import { NextResponse } from "next/server";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getVerifiedUser();
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("export_my_account");
  if (error)
    return NextResponse.json({ error: "export_failed" }, { status: 500 });

  return new NextResponse(
    JSON.stringify(
      {
        account: { id: user.id, email: user.email, createdAt: user.created_at },
        data,
      },
      null,
      2,
    ),
    {
      headers: {
        "content-disposition": `attachment; filename="goustia-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "content-type": "application/json; charset=utf-8",
        "cache-control": "private, no-store",
      },
    },
  );
}
