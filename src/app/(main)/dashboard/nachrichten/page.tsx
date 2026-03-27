"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send, Loader2, MessageCircle, Search, ArrowLeft, Info, X,
  Phone, Building2, FileText, Check, CheckCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { useSearchParams } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  contact_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

type ContactWithProfile = {
  id: string;
  tender_id: string;
  offer_id: string;
  buyer_id: string;
  dealer_id: string;
  status: string;
  dealer_responded: boolean;
  contract_concluded: boolean | null;
  created_at: string;
  // Joined partner profile
  partnerName: string;
  partnerCompany: string;
  partnerPhone: string | null;
  partnerCity: string | null;
  // Joined tender info
  tenderLabel: string;
  // Message preview
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
  const [showInfo, setShowInfo] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(!!initialContactId);

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
      // Load contacts
      const { data: rawContacts } = await supabase
        .from("contacts")
        .select("*")
        .or(`buyer_id.eq.${user.id},dealer_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (cancelled || !rawContacts || rawContacts.length === 0) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Load partner profiles
      const partnerIds = rawContacts.map((c: any) =>
        c.buyer_id === user.id ? c.dealer_id : c.buyer_id
      );
      const uniquePartnerIds = Array.from(new Set(partnerIds));

      const [profilesResult, messagesResult, tendersResult] = await Promise.all([
        supabase.from("profiles").select("id, company_name, first_name, last_name, phone, city").in("id", uniquePartnerIds),
        supabase.from("messages").select("contact_id, content, sender_id, read, created_at").in("contact_id", rawContacts.map((c: any) => c.id)).order("created_at", { ascending: false }),
        supabase.from("tenders").select("id, tender_vehicles(brand, model_name)").in("id", rawContacts.map((c: any) => c.tender_id)),
      ]);

      if (cancelled) return;

      const profileMap: Record<string, any> = {};
      (profilesResult.data || []).forEach((p: any) => { profileMap[p.id] = p; });

      const tenderMap: Record<string, string> = {};
      (tendersResult.data || []).forEach((t: any) => {
        const v = t.tender_vehicles?.[0];
        tenderMap[t.id] = v ? `${v.brand || ""} ${v.model_name || ""}`.trim() : "Ausschreibung";
      });

      // Group messages by contact for preview + unread
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
        const p = profileMap[partnerId];
        const msgInfo = msgByContact[c.id];
        return {
          ...c,
          partnerName: p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() : "Unbekannt",
          partnerCompany: p?.company_name || "Unbekannt",
          partnerPhone: p?.phone || null,
          partnerCity: p?.city || null,
          tenderLabel: tenderMap[c.tender_id] || "Ausschreibung",
          lastMessage: msgInfo?.last?.content || null,
          lastMessageAt: msgInfo?.last?.created_at || c.created_at,
          unreadCount: msgInfo?.unread || 0,
        };
      });

      // Sort by last message time
      enriched.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

      if (!cancelled) {
        setContactsList(enriched);
        // Auto-select first contact if none selected
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
        // Mark unread as read
        const unread = data.filter((m) => !m.read && m.sender_id !== user.id);
        if (unread.length > 0) {
          await supabase.from("messages").update({ read: true }).in("id", unread.map((m) => m.id));
          // Update local contact unread count
          setContactsList((prev) =>
            prev.map((c) => c.id === activeContactId ? { ...c, unreadCount: 0 } : c)
          );
        }
      }
      if (!cancelled) setMessagesLoading(false);
    })();

    return () => { cancelled = true; };
  }, [activeContactId, user?.id]);

  // Scroll on messages change
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

          // Update messages if this is the active chat
          if (msg.contact_id === activeContactId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            // Auto-mark as read
            if (msg.sender_id !== user.id) {
              supabase.from("messages").update({ read: true }).eq("id", msg.id).then();
            }
          }

          // Update contact list preview
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
            // Re-sort by last message
            updated.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
            return updated;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, activeContactId]);

  // ── Send message ─────────────────────────────────────────────────────────
  const canSend = (() => {
    if (!activeContact) return false;
    const isDealerInContact = user?.id === activeContact.dealer_id;
    if (isDealerInContact) return true; // dealer can always send
    return messages.length > 0; // buyer can only reply
  })();

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
        c.partnerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contactsList;

  // ── Select contact handler ───────────────────────────────────────────────
  const selectContact = (id: string) => {
    setActiveContactId(id);
    setMobileShowChat(true);
    setShowInfo(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-130px)] text-slate-400">
        <Loader2 className="animate-spin mr-3" size={28} />
        <span className="text-lg font-semibold">Nachrichten werden geladen…</span>
      </div>
    );
  }

  if (contactsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
          <MessageCircle size={36} />
        </div>
        <h3 className="text-xl font-bold text-navy-950 mb-2">Keine Nachrichten</h3>
        <p className="text-slate-500 max-w-sm">
          {isDealer
            ? "Sobald ein Nachfrager Sie kontaktiert, können Sie hier chatten."
            : "Nehmen Sie über Ihre Ausschreibungen Kontakt mit Anbietern auf, um hier zu chatten."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-130px)] bg-white border-t border-slate-200">
      {/* ── Left: Contact List ──────────────────────────────────── */}
      <div className={`w-full md:w-[350px] md:min-w-[350px] border-r border-slate-200 flex flex-col bg-white ${mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Suchen…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => {
            const isActive = contact.id === activeContactId;
            return (
              <button
                key={contact.id}
                onClick={() => selectContact(contact.id)}
                className={`w-full text-left px-4 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                  isActive ? "bg-blue-50 hover:bg-blue-50" : ""
                }`}
              >
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {contact.partnerCompany?.[0]?.toUpperCase() || "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-bold truncate ${isActive ? "text-blue-700" : "text-navy-950"}`}>
                      {contact.partnerCompany}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {formatListTime(contact.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 truncate">
                      {contact.lastMessage || "Noch keine Nachrichten"}
                    </p>
                    {contact.unreadCount > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <FileText size={9} /> {contact.tenderLabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Chat Area ────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {activeContact ? (
          <>
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden text-slate-500 hover:text-navy-950 mr-1"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-sm text-blue-700">
                  {activeContact.partnerCompany?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">{activeContact.partnerCompany}</h3>
                  <p className="text-xs text-slate-500">{activeContact.partnerName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfo(!showInfo)}
                className="rounded-full text-slate-400 hover:text-navy-950 hover:bg-slate-100"
              >
                {showInfo ? <X size={18} /> : <Info size={18} />}
              </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages area */}
              <div className="flex-1 flex flex-col min-w-0">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400">
                      <Loader2 className="animate-spin mr-2" size={20} /> Nachrichten laden…
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <MessageCircle size={40} className="text-slate-200 mb-3" />
                      <p className="text-sm text-slate-400 font-medium max-w-xs">
                        {canSend
                          ? "Noch keine Nachrichten. Starten Sie die Konversation!"
                          : "Warten auf die erste Nachricht des Händlers…"}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={`flex items-center gap-1 justify-end mt-1 ${isOwn ? "text-blue-200" : "text-slate-400"}`}>
                              <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                              {isOwn && (
                                msg.read
                                  ? <CheckCheck size={12} className="text-blue-200" />
                                  : <Check size={12} className="text-blue-300/50" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
                  {canSend ? (
                    <div className="flex items-end gap-2">
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
                        placeholder="Nachricht schreiben…"
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!text.trim() || sending}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-11 w-11 p-0 shrink-0"
                      >
                        {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-slate-400 py-2">
                      Warten auf die erste Nachricht des Händlers…
                    </p>
                  )}
                </div>
              </div>

              {/* Info panel */}
              {showInfo && (
                <div className="w-72 border-l border-slate-200 bg-white overflow-y-auto shrink-0 hidden md:block">
                  <div className="p-5 space-y-5">
                    <div className="flex flex-col items-center text-center pt-2">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center font-bold text-xl text-blue-700 mb-3">
                        {activeContact.partnerCompany?.[0]?.toUpperCase() || "?"}
                      </div>
                      <h3 className="font-bold text-navy-950">{activeContact.partnerCompany}</h3>
                      <p className="text-sm text-slate-500">{activeContact.partnerName}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      {activeContact.partnerPhone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {activeContact.partnerPhone}
                        </div>
                      )}
                      {activeContact.partnerCity && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 size={14} className="text-slate-400" />
                          {activeContact.partnerCity}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ausschreibung</h4>
                      <p className="text-sm font-semibold text-navy-950">{activeContact.tenderLabel}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Kontakt seit {new Date(activeContact.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</h4>
                      <div className="space-y-2">
                        <StatusStep done label="Kontakt aufgenommen" />
                        <StatusStep done={activeContact.dealer_responded} label="Händler hat geantwortet" />
                        <StatusStep
                          done={activeContact.contract_concluded != null}
                          label={
                            activeContact.contract_concluded === true ? "Vertrag — Ja"
                            : activeContact.contract_concluded === false ? "Vertrag — Nein"
                            : "Vertrag abgeschlossen"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <div>
              <MessageCircle size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-navy-950 mb-1">Wählen Sie einen Chat</h3>
              <p className="text-sm text-slate-500">Klicken Sie links auf einen Kontakt, um den Chat zu öffnen.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tiny status step component ──────────────────────────────────────────────
function StatusStep({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
        <Check size={10} />
      </div>
      <span className={done ? "text-green-700 font-semibold" : "text-slate-400"}>{label}</span>
    </div>
  );
}
