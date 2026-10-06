"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { jsonInit, useAdminFetch } from "./api";

type Message = { id: number; name: string; email: string; phone: string | null; message: string; isRead: boolean; createdAt: string };

export function MessagesTab({ onChanged }: { onChanged: () => void }) {
  const adminFetch = useAdminFetch();
  const [messages, setMessages] = useState<Message[] | null>(null);

  const load = useCallback(async () => {
    const data = await adminFetch<Message[]>("/api/messages");
    if (data) setMessages(data);
  }, [adminFetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, [load]);

  const setRead = async (m: Message, isRead: boolean) => {
    if (await adminFetch(`/api/messages/${m.id}`, jsonInit("PATCH", { isRead }))) {
      setMessages((list) => list?.map((x) => (x.id === m.id ? { ...x, isRead } : x)) ?? null);
      onChanged();
    }
  };

  const remove = async (m: Message) => {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    if (await adminFetch(`/api/messages/${m.id}`, { method: "DELETE" })) {
      setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
      onChanged();
    }
  };

  if (!messages) return <p className="text-sm text-gray-400">Loading...</p>;
  if (messages.length === 0) return <p className="text-sm text-gray-400">No messages yet. Messages sent from the Contact page will appear here.</p>;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={`rounded-xl border p-4 shadow-sm ${m.isRead ? "border-gray-100 bg-white" : "border-brand-purple/30 bg-brand-purple/5"}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">
                {m.name} {!m.isRead && <span className="ml-1 rounded-full bg-brand-purple px-2 py-0.5 text-[10px] font-semibold text-white">New</span>}
              </p>
              <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={() => setRead(m, !m.isRead)} className="text-gray-500 hover:text-brand-purple">
                Mark as {m.isRead ? "unread" : "read"}
              </button>
              <button aria-label="Delete" onClick={() => remove(m)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{m.message}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-brand-purple hover:underline">
              <Mail size={14} /> {m.email}
            </a>
            {m.phone && (
              <>
                <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-brand-purple hover:underline">
                  <Phone size={14} /> {m.phone}
                </a>
                <a
                  href={`https://wa.me/${m.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-green-600 hover:underline"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
