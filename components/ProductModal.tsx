"use client";

import type { Product, CatalogueState, ChatMessage } from "@/lib/types";
import { ProductAdvisor } from "./ProductAdvisor";

interface Props {
  product: Product;
  state: CatalogueState;
  messages: ChatMessage[];
  onClose: () => void;
}

export function ProductModal({ product, state, messages, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal content */}
      <div
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:flex h-full">
          {/* 1. Image Column (25%) */}
          <div className="md:w-[25%] bg-gray-50 flex items-start justify-center p-6 pt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-w-[280px] rounded"
            />
          </div>

          {/* 2. Details Column (45%) */}
          <div className="md:w-[45%] p-6 flex flex-col gap-4 border-r border-gray-100">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</div>
              <h2 className="text-xl font-semibold mt-1">{product.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Stars value={product.rating} />
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} ({product.numReviews.toLocaleString()} reviews)
                </span>
              </div>
              <div className="text-2xl font-bold mt-2">${product.price.toFixed(2)} <span className="text-sm font-normal text-gray-500">AUD</span></div>
            </div>

            {/* Overview */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Overview</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{product.productPageCopy.overview}</p>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Details</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{product.productPageCopy.details}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <TagRow label="Features" items={product.features} color="gray" />
              {product.colour.length > 0 && (
                <TagRow label="Colours" items={product.colour} color="gray" />
              )}
            </div>

            {/* Specifications */}
            {product.productPageCopy.specifications_summary && (
              <div className="border-t border-gray-100 pt-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Specifications</h3>
                <p className="text-xs text-gray-600">{product.productPageCopy.specifications_summary}</p>
              </div>
            )}

            {/* Buy Action */}
            <div className="mt-auto pt-4">
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                View on Amazon.com.au
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          </div>

          {/* 3. AI Advisor Column (25%) */}
          <div className="md:w-[25%] p-4 flex flex-col border-r border-gray-50">
            <ProductAdvisor product={product} state={state} messages={messages} />
          </div>

          {/* 4. Close Area (5%) */}
          <div className="md:w-[5%] bg-white flex flex-col items-center pt-3">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 text-xl transition-colors shadow-sm"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const COLORS: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  purple: "bg-purple-50 text-purple-700",
  orange: "bg-orange-50 text-orange-700"
};

function TagRow({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] text-gray-400 uppercase font-medium w-16 shrink-0">{label}</span>
      {items.map(item => (
        <span key={item} className={`px-2 py-0.5 rounded text-[11px] ${COLORS[color] ?? COLORS.gray}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="text-amber-500 text-sm">
      {"★★★★★".slice(0, full)}
      <span className="text-gray-300">{"★★★★★".slice(full)}</span>
    </span>
  );
}
