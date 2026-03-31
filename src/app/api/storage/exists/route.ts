import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ exists: false }, { status: 401 });
    }

    const { filePath, bucket } = await request.json();
    if (!filePath || !bucket) {
      return NextResponse.json({ exists: false });
    }

    // Reject path traversal
    if (filePath.includes("..")) {
      return NextResponse.json({ exists: false });
    }

    // Only allow known buckets
    const allowedBuckets = ["tender-config-files"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ exists: false });
    }

    // Only allow checking own files or offer files for own tenders
    const isOwnFile =
      filePath.startsWith(`${user.id}/`) ||
      filePath.startsWith(`offers/${user.id}/`);
    let hasAccess = isOwnFile;

    if (!hasAccess && filePath.startsWith("offers/")) {
      const parts = filePath.split("/");
      const tenderId = parts[2];
      if (tenderId) {
        const { data: tender } = await supabase
          .from("tenders")
          .select("buyer_id")
          .eq("id", tenderId)
          .single();
        hasAccess = tender?.buyer_id === user.id;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ exists: false });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const folder = filePath.substring(0, filePath.lastIndexOf("/"));
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);

    const { data, error } = await admin.storage.from(bucket).list(folder, {
      search: fileName,
      limit: 1,
    });

    const exists = !error && Array.isArray(data) && data.some((f) => f.name === fileName);

    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
