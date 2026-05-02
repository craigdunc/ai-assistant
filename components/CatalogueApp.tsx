"use client";

import { useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/products";
import { applyState } from "@/lib/filter-sort";
import { DEFAULT_STATE, type CatalogueState, type Product, type ChatMessage } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { FilterPanel } from "./FilterPanel";
import { SortDropdown } from "./SortDropdown";
import { SearchBar } from "./SearchBar";
import { ChatPanel } from "./ChatPanel";
import { ActiveFilters } from "./ActiveFilters";
import { ProductModal } from "./ProductModal";

export function CatalogueApp() {
  const [state, setState] = useState<CatalogueState>(DEFAULT_STATE);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi, welcome to TripKit! Are you looking for something in particular?"
    }
  ]);

  const [showFilters, setShowFilters] = useState(false);
  const visible = useMemo(() => applyState(PRODUCTS, state), [state]);

  const activeFilters = countActive(state);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-3">
          <div className="text-lg font-bold shrink-0">
            <span className="text-amber-400">Trip</span>Kit
          </div>
          <SearchBar
            value={state.query}
            onChange={q => setState(s => ({ ...s, query: q }))}
          />
          <div className="text-xs text-gray-400 hidden md:block shrink-0">
            {PRODUCTS.length} products
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden text-xs bg-gray-700 px-2 py-1 rounded"
          >
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>
        </div>
      </header>

      {/* Active filter chips */}
      <ActiveFilters state={state} onChange={setState} />

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto w-full px-4 py-3 grid grid-cols-12 gap-3 flex-1">
        {/* Filter sidebar */}
        <div className={`col-span-12 md:col-span-3 lg:col-span-2 ${showFilters ? "block" : "hidden md:block"}`}>
          <FilterPanel state={state} onChange={setState} />
        </div>

        {/* Product grid */}
        <section className="col-span-12 md:col-span-9 lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-1.5">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{visible.length}</span> result{visible.length === 1 ? "" : "s"}
              {activeFilters > 0 && (
                <button
                  className="ml-2 text-xs text-blue-600 hover:underline"
                  onClick={() => setState(DEFAULT_STATE)}
                >
                  Clear all filters
                </button>
              )}
            </div>
            <SortDropdown value={state.sort} onChange={sort => setState(s => ({ ...s, sort }))} />
          </div>

          {visible.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500">
              <div className="text-lg mb-2">No products match</div>
              <p className="text-sm">Try removing some filters, or ask the AI to help you find what you need.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {visible.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Chat panel */}
        <div className="col-span-12 lg:col-span-3">
          <ChatPanel 
            state={state} 
            onApplyState={setState} 
            resultCount={visible.length} 
            messages={messages}
            setMessages={setMessages}
            onSelectProduct={setSelectedProduct}
          />
        </div>
      </main>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          state={state}
          messages={messages}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

function countActive(s: CatalogueState): number {
  let n = 0;
  if (s.query) n++;
  if (s.categories.length) n++;
  if (s.brands.length) n++;
  if (s.priceMin != null) n++;
  if (s.priceMax != null) n++;
  if (s.minRating != null) n++;
  if (s.inStockOnly) n++;
  if (s.sort !== "relevance") n++;
  return n;
}
