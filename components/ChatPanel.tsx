"use client";

import { useState } from "react";
import { DEFAULT_STATE, type CatalogueState, type ChatMessage, type Product } from "@/lib/types";
import { applyState } from "@/lib/filter-sort";
import { PRODUCTS } from "@/lib/products";

interface Props {
  state: CatalogueState;
  onApplyState: (next: CatalogueState) => void;
  resultCount: number;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onSelectProduct: (p: Product) => void;
}

export function ChatPanel({ state, onApplyState, resultCount, messages, setMessages, onSelectProduct }: Props) {
  // We keep the full message history for the API context,
  // but only display the LATEST assistant reply in the UI.

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMini, setIsMini] = useState(false);

  const latestReply = [...messages].reverse().find(m => m.role === "assistant")?.content ?? "";
  const hasConversation = messages.length > 1;
  const results = applyState(PRODUCTS, state);

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Are you looking for something in particular?"
      }
    ]);
    setDraft("");
    setError(null);
    onApplyState(DEFAULT_STATE);
  };

  const send = async (text: string, retryCount = 0, overrideMessages?: ChatMessage[], overrideState?: CatalogueState) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const history = overrideMessages ?? [...messages, userMsg];
    const currentState = overrideState ?? state;
    const currentResultCount = applyState(PRODUCTS, currentState).length;

    if (retryCount === 0) {
      setMessages(history);
      setDraft("");
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, state: currentState, resultCount: currentResultCount })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data: { reply: string; state: CatalogueState } = await res.json();
      let finalState = data.state;

      // If 0 results, progressively remove filters one group at a time
      // (most niche first) until products appear — like a human backing up.
      if (applyState(PRODUCTS, finalState).length === 0) {
        const rollbacks: Array<Partial<CatalogueState>> = [
          { useCases: [] },
          { tripStages: [] },
          { travelStyles: [] },
          { query: "" },
          { categories: [] },
          { brands: [] },
          { priceMin: null, priceMax: null },
          { minRating: null },
        ];
        for (const patch of rollbacks) {
          finalState = { ...finalState, ...patch };
          if (applyState(PRODUCTS, finalState).length > 0) break;
        }
      }

      onApplyState(finalState);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

      // Handle auto-opening a specific product
      const results = applyState(PRODUCTS, finalState);
      const openId = (data as any).openProductId;
      
      if (openId) {
        const found = PRODUCTS.find(p => p.id === openId);
        if (found) onSelectProduct(found);
      } else if (results.length === 1) {
        // Auto-open if exactly one result is found (regular interaction)
        onSelectProduct(results[0]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      const isRateLimit = msg.includes("429") || msg.includes("quota");
      setError(isRateLimit ? null : msg);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: isRateLimit
          ? "I need a moment — too many requests. Try again in a few seconds."
          : `Sorry — something went wrong. ${msg}`
      }]);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || busy) return;
    send(draft.trim());
  };

  if (isMini) {
    return (
      <aside 
        onClick={() => setIsMini(false)}
        className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sticky top-14 z-30 animate-fade-in cursor-pointer hover:border-amber-300 transition-all"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assistant.png"
          alt="AI"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-[13px] font-bold text-gray-900 leading-none">Hello!</h2>
          <p className="text-[10px] mt-1" style={{ color: '#cccccc' }}>Your travel gear assistant</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-14 z-30 animate-fade-in overflow-hidden">
      {/* Header with Close/Reset */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 pr-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assistant.png"
            alt="AI"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">
              Hello!
            </h2>
            <p className="text-[11px] mt-1" style={{ color: '#cccccc' }}>Your travel gear assistant</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (!hasConversation) setIsMini(true);
            else resetChat();
          }}
          className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-all ${hasConversation ? "opacity-0 group-hover:opacity-100" : ""}`}
          title={hasConversation ? "Reset conversation" : "Minimize"}
        >
          {hasConversation && <span className="text-[10px] font-bold tracking-wider uppercase">Reset</span>}
          <span className="text-2xl leading-none">×</span>
        </button>
      </div>

      {/* Main Message Bubble */}
      <div className="bg-gray-50 rounded-2xl p-3 mb-4">
        {busy ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="thinking-dot" />
            <span className="thinking-dot" />
            <span className="thinking-dot" />
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed animate-fade-in">
            {latestReply}
          </p>
        )}
      </div>

      {/* Top pick — only after a conversation has produced results */}
      {!busy && hasConversation && results.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-2">Top pick</h3>
          <TopPick
            image={results[0].image}
            label={results[0].name}
            onClick={() => onSelectProduct(results[0])}
            isWide
          />
        </div>
      )}

      {/* Input Area */}
      <div className="mt-auto">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type your question..."
            disabled={busy}
            className="w-full px-5 py-3.5 pr-14 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-sm transition-all disabled:bg-gray-50 placeholder:text-gray-300"
          />

          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-black rounded-xl shadow-sm transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-3">
          AI advice, always check product details.
        </p>
      </div>

      {error && (
        <div className="mt-2 text-center">
          <span className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded-full">{error}</span>
        </div>
      )}
    </aside>
  );
}

function TopPick({ icon, image, label, onClick, isWide }: { icon?: string; image?: string; label: string; onClick: () => void, isWide?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex ${isWide ? 'flex-row items-center px-4 py-3' : 'flex-col items-center justify-center p-3'} gap-2 bg-gray-50 rounded-xl hover:bg-amber-50 hover:shadow-sm transition-all border border-transparent hover:border-amber-100 group overflow-hidden w-full`}
    >
      <div className={`${isWide ? 'w-12 h-12' : 'w-10 h-10'} flex items-center justify-center shrink-0`}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={label} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>
      <span className={`text-[10px] ${isWide ? 'font-medium text-blue-700 text-left' : 'font-normal text-gray-600 text-center line-clamp-2'} leading-tight group-hover:text-blue-900 transition-colors`}>{label}</span>
      {isWide && (
        <span className="ml-auto text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </span>
      )}
    </button>
  );
}

