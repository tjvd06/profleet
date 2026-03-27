"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function TopNav() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { data } = await supabase.rpc("get_unread_message_count");
      if (typeof data === "number") setUnreadCount(data);
    };

    fetchUnread();

    const channel = supabase
      .channel("topnav-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { fetchUnread(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      // Force the server to delete the Next.js cookies
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (e) {
      console.error("Server signout failed", e);
    }
    
    // Clear the client state
    await signOut();
    
    // Use hard redirect to ensure all Next.js router caches and server cookies are fully cleared
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-navy-950">proFleet</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-500 transition-colors">Startseite</Link>
            <Link href="/so-funktionierts" className="hover:text-blue-500 transition-colors">So funktioniert's</Link>
            <Link href="/ausschreibungen" className="hover:text-blue-500 transition-colors">Ausschreibungen</Link>
            <Link href="/sofort-angebote" className="hover:text-blue-500 transition-colors">Sofort-Angebote</Link>
            <Link href="/fuer-haendler" className="hover:text-blue-500 transition-colors">Für Händler</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/anmelden" className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors">
                Anmelden
              </Link>
              <Link href="/registrieren" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                Kostenlos starten
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/nachrichten" className="text-slate-500 hover:text-navy-950 relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-800 hover:bg-navy-200 transition-colors outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy-500 text-xs font-bold">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
                    : <User size={16} />}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 bg-white border-slate-200">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-bold flex flex-col gap-0.5">
                      <span className="text-navy-950">{profile?.first_name || "User"} {profile?.last_name || ""}</span>
                      <span className="text-[11px] text-slate-500 font-medium truncate">{user.email}</span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-slate-50 focus:bg-slate-50 flex items-center w-full font-semibold text-slate-600">
                      <User className="mr-2 h-4 w-4 text-slate-400" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/profil')} className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-slate-50 focus:bg-slate-50 flex items-center w-full font-semibold text-slate-600">
                      <Settings className="mr-2 h-4 w-4 text-slate-400" />
                      Profil & Einstellungen
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 rounded-lg px-3 py-2.5 font-bold">
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
