import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Authenticate the requesting user
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const storagePath = formData.get("storagePath") as string | null;
    const bucket = formData.get("bucket") as string | null;

    if (!file || !storagePath || !bucket) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Reject path traversal
    if (storagePath.includes("..")) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Max 20 MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }

    // Only allow known buckets
    const allowedBuckets = ["tender-config-files"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Verify the user has permission to upload to this path
    //    - Own files: path starts with user's ID
    //    - Offer files: path starts with offers/{user's ID}
    const isOwnPath =
      storagePath.startsWith(`${user.id}/`) ||
      storagePath.startsWith(`offers/${user.id}/`);

    if (!isOwnPath) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Upload with service role (bypasses RLS)
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await admin.storage.from(bucket).upload(storagePath, file, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error("[storage/upload] error:", error);
      return NextResponse.json(
        { error: "Upload failed", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ storagePath });
  } catch (err) {
    console.error("[storage/upload] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 },
    );
  }
}
