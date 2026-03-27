import { headers } from "next/headers";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-next-pathname") ?? "/";
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    // Dashboard has its own shell (sidebar + topbar), no TopNav/Footer
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
