import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  if (!(await getVerifiedUser())) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const { eventId } = await params;
  if (!z.uuid().safeParse(eventId).success) {
    return NextResponse.json(
      { error: "invalid_preference_signal" },
      { status: 400 },
    );
  }
  const { data, error } = await (
    await createClient()
  ).rpc("revert_preference_learning_signal", { p_event_id: eventId });
  if (error) {
    return NextResponse.json(
      { error: "preference_signal_reversal_failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ reverted: data });
}
