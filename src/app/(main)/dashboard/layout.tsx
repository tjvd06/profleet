import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/layout/DashboardShell";

// Paths that Nachfrager cannot access (prefix-matched)
const NACHFRAGER_BLOCKED: string[] = [
  "/dashboard/eingang",
  "/dashboard/angebote",
  "/dashboard/sofort-angebote/neu",
  "/dashboard/rechnungen",
];

// Paths that Anbieter cannot access (prefix-matched)
const ANBIETER_BLOCKED: string[] = [
  "/dashboard/ausschreibung/neu",
  "/dashboard/ausschreibungen",
];

function isBlocked(pathname: string, blockedPaths: string[]): boolean {
  return blockedPaths.some(
    (blocked) => pathname === blocked || pathname.startsWith(blocked + "/")
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/anmelden");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "nachfrager") as "nachfrager" | "anbieter";

  const pathname = headers().get("x-next-pathname") ?? "/dashboard";

  if (role === "nachfrager" && isBlocked(pathname, NACHFRAGER_BLOCKED)) {
    redirect("/dashboard");
  }

  if (role === "anbieter" && isBlocked(pathname, ANBIETER_BLOCKED)) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell role={role}>
      {children}
    </DashboardShell>
  );
}
