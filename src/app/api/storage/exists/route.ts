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

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // List the exact file path in the bucket
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
