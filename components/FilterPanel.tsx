"use client";

import { useState } from "react";
import type { CatalogueState, Category } from "@/lib/types";
import { ALL_BRANDS, ALL_CATEGORIES, PRICE_BOUNDS } from "@/lib/products";

interface Props {
  state: CatalogueState;
  onChange: (next: CatalogueState) => void;
}

export function FilterPanel({ state, onChange }: Props) {
  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter(x => x !== value) : [...list, value];

  return (
    <aside className="bg-white rounded border border-gray-300 text-xs flex flex-col sticky top-14 z-30 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-300 font-semibold text-gray-800">
        Filters
      </div>

      <FilterSection title="Category" defaultOpen>
        {ALL_CATEGORIES.map(c => (
          <label key={c} className="flex items-center gap-2 cursor-pointer py-0.5">
            <input
              type="checkbox"
              checked={state.categories.includes(c)}
              onChange={() => onChange({ ...state, categories: toggle<Category>(state.categories, c) })}
              className="accent-amber-500"
            />
            <span className="text-gray-700">{c}</span>
          </label>
        ))}
      </FilterSection>



      <FilterSection title="Price (AUD)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={`${PRICE_BOUNDS.min}`}
            value={state.priceMin ?? ""}
            onChange={e => onChange({ ...state, priceMin: e.target.value === "" ? null : Number(e.target.value) })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder={`${PRICE_BOUNDS.max}`}
            value={state.priceMax ?? ""}
            onChange={e => onChange({ ...state, priceMax: e.target.value === "" ? null : Number(e.target.value) })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
          />
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        {[4, 3, 2].map(r => (
          <label key={r} className="flex items-center gap-2 cursor-pointer py-0.5">
            <input
              type="radio"
              name="minRating"
              checked={state.minRating === r}
              onChange={() => onChange({ ...state, minRating: r })}
              className="accent-amber-500"
            />
            <span className="text-amber-500">{"★".repeat(Math.floor(r))}{r % 1 ? "½" : ""}</span>
            <span className="text-xs text-gray-500">& up</span>
          </label>
        ))}
        <label className="flex items-center gap-2 cursor-pointer py-0.5">
          <input
            type="radio"
            name="minRating"
            checked={state.minRating === null}
            onChange={() => onChange({ ...state, minRating: null })}
            className="accent-amber-500"
          />
          <span className="text-xs text-gray-500">Any rating</span>
        </label>
      </FilterSection>

      <FilterSection title="Brand">
        <div className="max-h-40 overflow-y-auto">
          {ALL_BRANDS.map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={state.brands.includes(b)}
                onChange={() => onChange({ ...state, brands: toggle<string>(state.brands, b) })}
                className="accent-amber-500"
              />
              <span className="text-gray-700">{b}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="px-3 py-2 border-t border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.inStockOnly}
            onChange={e => onChange({ ...state, inStockOnly: e.target.checked })}
            className="accent-amber-500"
          />
          <span className="text-gray-700">In stock only</span>
        </label>
      </div>
    </aside>
  );
}

/* Collapsible filter section */
function FilterSection({
  title,
  defaultOpen = false,
  children
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800">{title}</span>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-3 pb-2 flex flex-col gap-0.5 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
