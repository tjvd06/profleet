"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send, Loader2, MessageCircle, Search, ArrowLeft, Info,
  Phone, Check, CheckCheck, Mail, MapPin, Car, Users, ExternalLink,
  Smile,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  contact_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

type PartnerProfile = {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email_public: string | null;
  city: string | null;
  zip: string | null;
  street: string | null;
  role: string | null;
  subscription_tier: string | null;
  industry: string | null;
  dealer_type: string | null;
};

type TenderInfo = {
  id: string;
  status: string;
  tender_vehicles: { brand: string | null; model_name: string | null; quantity: number }[];
};

type ContactWithProfile = {
  id: string;
  tender_id: string;
  offer_id: string;
  buyer_id: string;
  dealer_id: string;
  status: string;
  created_at: string;
  partner: PartnerProfile | null;
  tender: TenderInfo | null;
  tenderLabel: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  if (isYesterday) return `Gestern ${time}`;
  return `${d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} ${time}`;
}

function formatListTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Gestern";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialContactId = searchParams.get("contact");
  const [supabase] = useState(() => createClient());

  const [contactsList, setContactsList] = useState<ContactWithProfile[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(initialContactId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(!!initialContactId);
  const [showDetails, setShowDetails] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isDealer = profile?.role === "anbieter";
  const activeContact = contactsList.find((c) => c.id === activeContactId);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  // ── Load contacts with profiles ──────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    (async () => {
      const { data: rawContacts } = await supabase
        .from("contacts")
        .select("*")
        .or(`buyer_id.eq.${user.id},dealer_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (cancelled || !rawContacts || rawContacts.length === 0) {
        if (!cancelled) setLoading(false);
        return;
      }

      const partnerIds = rawContacts.map((c: any) =>
        c.buyer_id === user.id ? c.dealer_id : c.buyer_id
      );
      const uniquePartnerIds = Array.from(new Set(partnerIds));

      const [profilesResult, messagesResult, tendersResult] = await Promise.all([
        supabase.from("profiles").select("id, company_name, first_name, last_name, phone, email_public, city, zip, street, role, industry, dealer_type").in("id", uniquePartnerIds),
        supabase.from("messages").select("contact_id, content, sender_id, read, created_at").in("contact_id", rawContacts.map((c: any) => c.id)).order("created_at", { ascending: false }),
        supabase.from("tenders").select("id, status, tender_vehicles(brand, model_name, quantity)").in("id", rawContacts.map((c: any) => c.tender_id)),
      ]);

      if (cancelled) return;

      const profileMap: Record<string, PartnerProfile> = {};
      (profilesResult.data || []).forEach((p: any) => { profileMap[p.id] = p; });

      const tenderMap: Record<string, TenderInfo> = {};
      (tendersResult.data || []).forEach((t: any) => { tenderMap[t.id] = t; });

      const msgByContact: Record<string, { last: any; unread: number }> = {};
      (messagesResult.data || []).forEach((m: any) => {
        if (!msgByContact[m.contact_id]) {
          msgByContact[m.contact_id] = { last: m, unread: 0 };
        }
        if (!m.read && m.sender_id !== user.id) {
          msgByContact[m.contact_id].unread++;
        }
      });

      const enriched: ContactWithProfile[] = rawContacts.map((c: any) => {
        const partnerId = c.buyer_id === user.id ? c.dealer_id : c.buyer_id;
        const partner = profileMap[partnerId] || null;
        const tender = tenderMap[c.tender_id] || null;
        const v = tender?.tender_vehicles?.[0];
        const tenderLabel = v ? `${v.brand || ""} ${v.model_name || ""}`.trim() : "Ausschreibung";
        const msgInfo = msgByContact[c.id];
        return {
          ...c,
          partner,
          tender,
          tenderLabel,
          lastMessage: msgInfo?.last?.content || null,
          lastMessageAt: msgInfo?.last?.created_at || c.created_at,
          unreadCount: msgInfo?.unread || 0,
        };
      });

      enriched.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

      if (!cancelled) {
        setContactsList(enriched);
        if (!activeContactId && enriched.length > 0) {
          setActiveContactId(enriched[0].id);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  // ── Load messages for active contact ─────────────────────────────────────
  useEffect(() => {
    if (!activeContactId || !user) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("contact_id", activeContactId)
        .order("created_at", { ascending: true });

      if (!cancelled && data) {
        setMessages(data);
        const unread = data.filter((m) => !m.read && m.sender_id !== user.id);
        if (unread.length > 0) {
          await supabase.from("messages").update({ read: true }).in("id", unread.map((m) => m.id));
          setContactsList((prev) =>
            prev.map((c) => c.id === activeContactId ? { ...c, unreadCount: 0 } : c)
          );
        }
      }
      if (!cancelled) setMessagesLoading(false);
    })();

    return () => { cancelled = true; };
  }, [activeContactId, user?.id]);

  useEffect(() => {
    if (!messagesLoading) scrollToBottom();
  }, [messages.length, messagesLoading, scrollToBottom]);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-page-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;

          if (msg.contact_id === activeContactId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            if (msg.sender_id !== user.id) {
              supabase.from("messages").update({ read: true }).eq("id", msg.id).then();
            }
          }

          setContactsList((prev) => {
            const updated = prev.map((c) => {
              if (c.id !== msg.contact_id) return c;
              return {
                ...c,
                lastMessage: msg.content,
                lastMessageAt: msg.created_at,
                unreadCount: msg.contact_id === activeContactId ? c.unreadCount : c.unreadCount + (msg.sender_id !== user.id ? 1 : 0),
              };
            });
            updated.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
            return updated;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, activeContactId]);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !user || sending || !activeContactId) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      contact_id: activeContactId,
      sender_id: user.id,
      content: text.trim(),
    });

    if (!error) {
      setText("");
      inputRef.current?.focus();
    }
    setSending(false);
  };

  // ── Filtered contacts ────────────────────────────────────────────────────
  const filteredContacts = searchQuery
    ? contactsList.filter((c) =>
        (c.partner?.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.partner?.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contactsList;

  const selectContact = (id: string) => {
    setActiveContactId(id);
    setMobileShowChat(true);
    setShowDetails(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-130px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <MessageCircle size={28} className="text-white" />
            </div>
            <Loader2 className="animate-spin text-blue-500 absolute -bottom-1 -right-1" size={20} />
          </div>
          <span className="text-sm font-medium text-slate-400">Nachrichten werden geladen...</span>
        </div>
      </div>
    );
  }

  if (contactsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] text-center px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <MessageCircle size={40} className="text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-navy-950 mb-2">Keine Nachrichten</h3>
        <p className="text-slate-500 max-w-sm leading-relaxed">
          {isDealer
            ? "Sobald ein Nachfrager Sie kontaktiert, erscheinen Ihre Nachrichten hier."
            : "Nehmen Sie über Ihre Ausschreibungen Kontakt mit Händlern auf."}
        </p>
      </div>
    );
  }

  const p = activeContact?.partner;
  const t = activeContact?.tender;
  const partnerInitials = p?.company_name
    ? p.company_name.substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="flex h-[calc(100vh-130px)] bg-slate-50">
      {/* ── Left: Conversation List ──────────────────────────────── */}
      <div className={`w-full md:w-[360px] md:min-w-[360px] border-r border-slate-200/80 flex flex-col bg-white ${mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {/* Search header */}
        <div className="p-4 pb-3">
          <h2 className="text-lg font-bold text-navy-950 mb-3">Nachrichten</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-slate-50/80 border-slate-200/60 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => {
            const isActive = contact.id === activeContactId;
            const partnerName = contact.partner?.company_name || "";
            const companyName = contact.partner?.company_name || "Unbekannt";
            const initials = companyName.substring(0, 2).toUpperCase();
            const hasUnread = contact.unreadCount > 0;

            return (
              <button
                key={contact.id}
                onClick={() => selectContact(contact.id)}
                className={`w-full text-left px-4 py-3.5 transition-all flex items-center gap-3 relative group ${
                  isActive
                    ? "bg-blue-50/70"
                    : "hover:bg-slate-50/80"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-blue-600 rounded-r-full" />
                )}

                {/* Avatar */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
                    : hasUnread
                    ? "bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[13px] truncate flex items-center gap-1.5 ${
                      hasUnread ? "font-bold text-navy-950" : "font-semibold text-navy-950"
                    }`}>
                      {companyName}
                                          </span>
                    <span className={`text-[11px] shrink-0 ml-2 ${hasUnread ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                      {formatListTime(contact.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate leading-relaxed ${hasUnread ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                      {contact.lastMessage || partnerName || "Neue Konversation"}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shrink-0 shadow-sm shadow-blue-600/30">
                        {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Car size={10} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-400 truncate">{contact.tenderLabel}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Center: Chat Area ────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {activeContact ? (
          <>
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden text-slate-400 hover:text-navy-950 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-blue-500/20">
                  {partnerInitials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-navy-950 flex items-center gap-1.5 truncate">
                    {p?.company_name || "Unbekannt"}
                                      </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {p?.company_name || "—"}
                    {activeContact.tenderLabel !== "Ausschreibung" && (
                      <span className="text-slate-300 mx-1.5">|</span>
                    )}
                    {activeContact.tenderLabel !== "Ausschreibung" && activeContact.tenderLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  showDetails ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Info size={14} />
                Details
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages area */}
              <div className="flex-1 flex flex-col min-w-0">
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-1"
                  style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}
                >
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                      <Loader2 className="animate-spin mr-2" size={18} />
                      <span className="text-sm">Nachrichten laden...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                        <Smile size={28} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Noch keine Nachrichten</p>
                      <p className="text-xs text-slate-400">Sagen Sie Hallo!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => {
                        const isOwn = msg.sender_id === user?.id;
                        const prevMsg = i > 0 ? messages[i - 1] : null;
                        const sameSender = prevMsg?.sender_id === msg.sender_id;
                        const timeDiff = prevMsg
                          ? new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
                          : Infinity;
                        const showGap = timeDiff > 300000; // 5 min gap

                        return (
                          <div key={msg.id}>
                            {showGap && (
                              <div className="flex justify-center my-4">
                                <span className="text-[10px] text-slate-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${sameSender && !showGap ? "mt-0.5" : "mt-3"}`}>
                              <div
                                className={`max-w-[70%] px-4 py-2.5 ${
                                  isOwn
                                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-br-lg shadow-sm shadow-blue-500/10"
                                    : "bg-white text-slate-800 rounded-2xl rounded-bl-lg shadow-sm border border-slate-100"
                                }`}
                              >
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                <div className={`flex items-center gap-1 justify-end mt-1 ${isOwn ? "text-blue-200/80" : "text-slate-400"}`}>
                                  <span className="text-[10px]">
                                    {new Date(msg.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {isOwn && (
                                    msg.read
                                      ? <CheckCheck size={13} className="text-blue-200" />
                                      : <Check size={13} className="text-blue-300/40" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Message input */}
                <div className="px-4 md:px-6 py-3 bg-white border-t border-slate-200/60 shrink-0">
                  <div className="flex items-end gap-2.5">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Nachricht schreiben..."
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 focus:bg-white max-h-32 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <Button
                      onClick={handleSend}
                      disabled={!text.trim() || sending}
                      className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-[46px] w-[46px] p-0 shrink-0 shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:shadow-none transition-all"
                    >
                      {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── Right: Contact Details Panel ──────────────────── */}
              {showDetails && (
                <div className="w-[340px] border-l border-slate-200/80 bg-white overflow-y-auto shrink-0 hidden lg:block animate-in slide-in-from-right-4 duration-200">
                  <div className="p-6 space-y-6">
                    {/* Partner profile */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center font-bold text-xl text-white mb-4 shadow-lg shadow-blue-500/20">
                        {partnerInitials}
                      </div>
                      <h3 className="font-bold text-navy-950 text-lg leading-tight">
                        {p?.company_name || "Unbekannt"}
                      </h3>
                      {p?.city && <p className="text-sm text-slate-500 mt-0.5">{p.zip || ""} {p.city}</p>}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                                                {p?.dealer_type && (
                          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500 font-medium">{p.dealer_type}</Badge>
                        )}
                        {p?.industry && (
                          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500 font-medium">{p.industry}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Contact info cards */}
                    <div className="space-y-2">
                      {p?.email_public && (
                        <a
                          href={`mailto:${p.email_public}`}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center shrink-0 group-hover:bg-blue-200/60 transition-colors">
                            <Mail size={15} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">E-Mail</p>
                            <p className="text-sm font-medium text-navy-950 truncate">{p.email_public}</p>
                          </div>
                        </a>
                      )}
                      {p?.phone && (
                        <a
                          href={`tel:${p.phone}`}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-green-50 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-green-100/80 flex items-center justify-center shrink-0 group-hover:bg-green-200/60 transition-colors">
                            <Phone size={15} className="text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Telefon</p>
                            <p className="text-sm font-medium text-navy-950">{p.phone}</p>
                          </div>
                        </a>
                      )}
                      {(p?.street || p?.zip || p?.city) && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80">
                          <div className="w-9 h-9 rounded-lg bg-amber-100/80 flex items-center justify-center shrink-0">
                            <MapPin size={15} className="text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Adresse</p>
                            <p className="text-sm font-medium text-navy-950">
                              {p?.street && <>{p.street}<br /></>}
                              {[p?.zip, p?.city].filter(Boolean).join(" ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tender info */}
                    {t && (
                      <div className="pt-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Ausschreibung</h4>
                        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-100 space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-mono text-slate-500 bg-white">{t.id.split("-")[0].toUpperCase()}</Badge>
                            <Badge className={`text-[10px] border-none ${t.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                              {t.status === "active" ? "Aktiv" : t.status === "cancelled" ? "Zurückgezogen" : "Abgeschlossen"}
                            </Badge>
                          </div>
                          {t.tender_vehicles.map((v, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Car size={14} className="text-blue-500 shrink-0" />
                              <span className="font-semibold text-navy-950">{v.quantity}x {v.brand || "—"} {v.model_name || ""}</span>
                            </div>
                          ))}
                          <Link
                            href={isDealer ? `/dashboard/eingang/${t.id}/angebot` : `/dashboard/ausschreibungen`}
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1 transition-colors"
                          >
                            <ExternalLink size={11} />
                            Zur Ausschreibung
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Contact since */}
                    <div className="text-center pt-2">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Kontakt seit {new Date(activeContact.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center px-4 bg-slate-50/50">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-5">
                <MessageCircle size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-navy-950 mb-1">Wählen Sie eine Konversation</h3>
              <p className="text-sm text-slate-500 max-w-xs">Klicken Sie links auf eine Konversation, um den Chat zu öffnen.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
