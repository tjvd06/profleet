import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// This endpoint should be called by a cron job (e.g. Vercel Cron, external scheduler)
// It marks all active tenders whose end_at has passed as 'completed'.

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("tenders")
    .update({ status: "completed" })
    .eq("status", "active")
    .lte("end_at", new Date().toISOString())
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Completed ${data?.length ?? 0} tender(s)`,
    ids: data?.map((t) => t.id) ?? [],
  });
}
