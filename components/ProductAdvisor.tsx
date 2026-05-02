"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product, CatalogueState, ChatMessage } from "@/lib/types";

interface Props {
  product: Product;
  state: CatalogueState;
  messages: ChatMessage[];
}

/**
 * A mini AI advisor that appears inside the product modal.
 * Auto-loads a recommendation when the product is viewed,
 * and allows follow-up questions about the specific product.
 */
export function ProductAdvisor({ product, state, messages }: Props) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false); // Default to not busy if mini
  const [draft, setDraft] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const isInitial = messages.length <= 1;
  const showMini = isInitial && !hasInteracted;

  // Build a smart fallback using real product data (no API needed)
  const buildFallback = useCallback(() => {
    const feat = product.features[0] ?? "great design";
    const stars = product.rating >= 4.5 ? "highly rated" : "well reviewed";
    return `The ${product.name} is ${stars} at ${product.rating}★ — customers love the ${feat.toLowerCase()}. At $${product.price}, it's a solid pick.`;
  }, [product]);

  // Build product context string for the LLM
  const productContext = useMemo(() => {
    return `${product.name} by ${product.brand} — ${product.category}, $${product.price} AUD, ${product.rating}★ (${product.numReviews} reviews). ${product.description}. Features: ${product.features.join(", ")}. ${product.productPageCopy.recommendation_context}`;
  }, [product]);

  const loadRecommendation = useCallback(async (isReset = false) => {
    setBusy(true);
    setHasInteracted(true);
    if (isReset) {
      setReply("");
    }
    
    const filtersDesc = [
      state.categories.length ? `categories: ${state.categories.join(", ")}` : "",
      state.travelStyles.length ? `style: ${state.travelStyles.join(", ")}` : "",
      state.useCases.length ? `use cases: ${state.useCases.join(", ")}` : "",
      state.query ? `search: "${state.query}"` : "",
    ].filter(Boolean).join("; ");

    try {
      const r = await fetch("/api/product-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productContext,
          searchContext: filtersDesc || "browsing the full catalogue",
          chatHistory: messages,
          question: null
        })
      });
      const data = await r.json();
      setReply(data.reply || buildFallback());
    } catch {
      setReply(buildFallback());
    } finally {
      setBusy(false);
    }
  }, [productContext, messages, state, buildFallback]);

  // Auto-load initial recommendation ONLY if we already have a chat history
  useEffect(() => {
    if (!isInitial) {
      loadRecommendation();
    }
  }, [loadRecommendation, isInitial]);

  const ask = async (q?: string) => {
    const question = q ?? draft.trim();
    if (!question || busy) return;
    
    setDraft("");
    setBusy(true);
    setHasInteracted(true);
    try {
      const res = await fetch("/api/product-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productContext,
          searchContext: "the user is viewing this product",
          chatHistory: messages,
          question
        })
      });
      const data = await res.json();
      setReply(data.reply ?? "");
    } catch {
      setReply("Sorry, I couldn't answer that right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-fade-in relative ${showMini ? "" : "h-full"}`}>
      {/* Header with Reset */}
      <div className="flex items-center gap-3 mb-3 pr-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assistant.png"
          alt="AI"
          className="w-10 h-10 rounded-full shadow-sm"
        />
        <div>
          <h2 className="text-[14px] font-bold text-gray-900 leading-none">
            Hello!
          </h2>
          <p className="text-[9px] mt-1" style={{ color: '#cccccc' }}>Travel gear assistant</p>
        </div>
        {hasInteracted && (
          <button
            onClick={() => { setReply(""); setHasInteracted(false); }}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="Reset advisor"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase">Reset</span>
            <span className="text-xl leading-none">×</span>
          </button>
        )}
      </div>

      {!showMini && (
        <div className="bg-gray-50 rounded-2xl p-3 mb-4 border border-gray-100/50">
          {busy ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          ) : (
            <p className="text-[13px] text-gray-700 leading-relaxed animate-fade-in">
              {reply}
            </p>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="mt-4">
        <form onSubmit={e => { e.preventDefault(); ask(); }} className="relative">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Ask a question..."
            disabled={busy}
            className="w-full px-4 py-2.5 pr-12 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-sm transition-all disabled:bg-gray-50 placeholder:text-gray-300"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-black rounded-lg shadow-sm transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
        <p className="text-[8px] text-gray-400 text-center mt-2">
          AI advice, always check product details.
        </p>
      </div>
    </div>
  );
}

