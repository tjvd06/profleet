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
  { label: "Sofort-Angebote", href: "/dashboard/sofort-angebote", icon: Zap },
  { label: "Nachrichten", href: "/dashboard/nachrichten", icon: MessageCircle, badgeKey: "messages" },
  { label: "Bewertungen", href: "/dashboard/bewertungen", icon: Star, badgeKey: "reviews" },
  { label: "Profil", href: "/dashboard/profil", icon: UserCircle },
];

const ANBIETER_TABS: Tab[] = [
  { label: "Übersicht", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Eingang", href: "/dashboard/eingang", icon: Inbox },
  { label: "Meine Angebote", href: "/dashboard/angebote", icon: Handshake },
  { label: "Sofort-Angebote", href: "/dashboard/sofort-angebote", icon: Zap },
  { label: "Nachrichten", href: "/dashboard/nachrichten", icon: MessageCircle, badgeKey: "messages" },
  { label: "Bewertungen", href: "/dashboard/bewertungen", icon: Star, badgeKey: "reviews" },
  { label: "Abo & Abrechnung", href: "/dashboard/abo", icon: ReceiptText },
  { label: "Profil", href: "/dashboard/profil", icon: UserCircle },
];

export function DashboardNav({ role }: { role: "nachfrager" | "anbieter" }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const tabs = role === "anbieter" ? ANBIETER_TABS : NACHFRAGER_TABS;
  const [unreadCount, setUnreadCount] = useState(0);
  const [openReviewCount, setOpenReviewCount] = useState(0);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { data } = await supabase.rpc("get_unread_message_count");
      if (typeof data === "number") setUnreadCount(data);
    };

    const fetchOpenReviews = async () => {
      // Get contacts for this user (as buyer or dealer) on completed/cancelled tenders
      const contactCol = role === "nachfrager" ? "buyer_id" : "dealer_id";
      const { data: contacts } = await supabase
        .from("contacts")
        .select("id, tender_id, tenders!inner(status)")
        .eq(contactCol, user.id)
        .in("tenders.status", ["completed", "cancelled"]);
      if (!contacts || contacts.length === 0) { setOpenReviewCount(0); return; }

      const contactIds = contacts.map((c: any) => c.id);
      const { data: existingReviews } = await supabase
        .from("reviews")
        .select("contact_id")
        .eq("from_user_id", user.id)
        .in("contact_id", contactIds);
      const reviewedIds = new Set((existingReviews || []).map((r: any) => r.contact_id));
      setOpenReviewCount(contactIds.filter(id => !reviewedIds.has(id)).length);
    };

    fetchUnread();
    fetchOpenReviews();

    const channel = supabase
      .channel("nav-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { fetchUnread(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, role]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            const showBadge = (tab.badgeKey === "messages" && unreadCount > 0) || (tab.badgeKey === "reviews" && openReviewCount > 0);
            const badgeCount = tab.badgeKey === "messages" ? unreadCount : openReviewCount;
            const badgeColor = tab.badgeKey === "reviews" ? "bg-amber-500" : "bg-red-500";
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
                  <span className={`ml-1 ${badgeColor} text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
                    {badgeCount > 99 ? "99+" : badgeCount}
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
