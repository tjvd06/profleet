"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";

type Message = {
  id: string;
  contact_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

type ChatWindowProps = {
  contactId: string;
  partnerName: string;
  partnerCompany: string;
  /** If true, only the dealer can send the first message */
  dealerMustInitiate?: boolean;
  dealerId?: string;
  onClose: () => void;
  onMessageSent?: () => void;
};

export function ChatWindow({
  contactId,
  partnerName,
  partnerCompany,
  dealerMustInitiate,
  dealerId,
  onClose,
  onMessageSent,
}: ChatWindowProps) {
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isDealer = user?.id === dealerId;
  const hasMessages = messages.length > 0;
  const canSend = dealerMustInitiate
    ? isDealer || hasMessages
    : true;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  // Load messages
  useEffect(() => {
    if (!contactId || !user) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: true });

      if (!cancelled && data) {
        setMessages(data);
        // Mark unread messages as read
        const unread = data.filter((m) => !m.read && m.sender_id !== user.id);
        if (unread.length > 0) {
          await supabase
            .from("messages")
            .update({ read: true })
            .in("id", unread.map((m) => m.id));
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [contactId, user?.id]);

  // Scroll on load + new messages
  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages.length, loading, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    if (!contactId) return;

    const channel = supabase
      .channel(`messages:${contactId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `contact_id=eq.${contactId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto-mark as read if we're the recipient
          if (msg.sender_id !== user?.id) {
            supabase.from("messages").update({ read: true }).eq("id", msg.id).then();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [contactId, user?.id]);

  const handleSend = async () => {
    if (!text.trim() || !user || sending) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      contact_id: contactId,
      sender_id: user.id,
      content: text.trim(),
    });

    if (!error) {
      setText("");
      onMessageSent?.();
      inputRef.current?.focus();
    }
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    if (isToday) return time;
    return `${d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} ${time}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-navy-950 to-blue-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-sm">
              {(partnerCompany || partnerName)?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h3 className="font-bold text-sm">{partnerCompany || "Unbekannt"}</h3>
              <p className="text-xs text-blue-200">{partnerName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
            <X size={20} />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={20} /> Nachrichten laden…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle size={40} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-medium">
                {canSend
                  ? "Noch keine Nachrichten. Starten Sie die Konversation!"
                  : "Der Händler wurde kontaktiert. Sobald er antwortet, können Sie hier chatten."}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isOwn ? "text-blue-200" : "text-slate-400"}`}>
                      {formatTime(msg.created_at)}
                    </p>
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
    </div>
  );
}
