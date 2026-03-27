"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  FileText,
  Zap,
  Star,
  Inbox,
  Handshake,
  ReceiptText,
  UserCircle,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";

type Tab = {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badgeKey?: string;
};

const NACHFRAGER_TABS: Tab[] = [
  { label: "Übersicht", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Neue Ausschreibung", href: "/dashboard/ausschreibung/neu", icon: Plus },
  { label: "Meine Ausschreibungen", href: "/dashboard/ausschreibungen", icon: FileText },
  { label: "Nachrichten", href: "/dashboard/nachrichten", icon: MessageCircle, badgeKey: "messages" },
  { label: "Sofort-Angebote", href: "/dashboard/sofort-angebote", icon: Zap },
  { label: "Bewertungen", href: "/dashboard/bewertungen", icon: Star },
  { label: "Profil", href: "/dashboard/profil", icon: UserCircle },
];

const ANBIETER_TABS: Tab[] = [
  { label: "Übersicht", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Eingang", href: "/dashboard/eingang", icon: Inbox },
  { label: "Meine Angebote", href: "/dashboard/angebote", icon: Handshake },
  { label: "Nachrichten", href: "/dashboard/nachrichten", icon: MessageCircle, badgeKey: "messages" },
  { label: "Sofort-Angebote", href: "/dashboard/sofort-angebote", icon: Zap },
  { label: "Bewertungen", href: "/dashboard/bewertungen", icon: Star },
  { label: "Rechnungen", href: "/dashboard/rechnungen", icon: ReceiptText },
  { label: "Profil", href: "/dashboard/profil", icon: UserCircle },
];

export function DashboardNav({ role }: { role: "nachfrager" | "anbieter" }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const tabs = role === "anbieter" ? ANBIETER_TABS : NACHFRAGER_TABS;
  const [unreadCount, setUnreadCount] = useState(0);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { data } = await supabase.rpc("get_unread_message_count");
      if (typeof data === "number") setUnreadCount(data);
    };

    fetchUnread();

    const channel = supabase
      .channel("nav-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { fetchUnread(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            const showBadge = tab.badgeKey === "messages" && unreadCount > 0;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-navy-950 hover:border-slate-300"
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {showBadge && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
