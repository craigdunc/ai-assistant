"use client";

import type { CatalogueState } from "@/lib/types";
import { DEFAULT_STATE } from "@/lib/types";

interface Props {
  state: CatalogueState;
  onChange: (next: CatalogueState) => void;
}

interface Chip {
  label: string;
  group: string;
  onRemove: () => void;
}

export function ActiveFilters({ state, onChange }: Props) {
  const chips: Chip[] = [];

  if (state.query) {
    chips.push({
      label: `"${state.query}"`,
      group: "Search",
      onRemove: () => onChange({ ...state, query: "" })
    });
  }

  for (const c of state.categories) {
    chips.push({
      label: c,
      group: "Category",
      onRemove: () => onChange({ ...state, categories: state.categories.filter(x => x !== c) })
    });
  }



  for (const b of state.brands) {
    chips.push({
      label: b,
      group: "Brand",
      onRemove: () => onChange({ ...state, brands: state.brands.filter(x => x !== b) })
    });
  }

  if (state.priceMin != null || state.priceMax != null) {
    const label = state.priceMin != null && state.priceMax != null
      ? `$${state.priceMin}–$${state.priceMax}`
      : state.priceMin != null
        ? `From $${state.priceMin}`
        : `Up to $${state.priceMax}`;
    chips.push({
      label,
      group: "Price",
      onRemove: () => onChange({ ...state, priceMin: null, priceMax: null })
    });
  }

  if (state.minRating != null) {
    chips.push({
      label: `${state.minRating}+ stars`,
      group: "Rating",
      onRemove: () => onChange({ ...state, minRating: null })
    });
  }

  if (state.sort !== "relevance") {
    const sortLabels: Record<string, string> = {
      "price-asc": "Price: Low → High",
      "price-desc": "Price: High → Low",
      "rating-desc": "Best Rated",
      "newest": "Newest"
    };
    chips.push({
      label: sortLabels[state.sort] ?? state.sort,
      group: "Sort",
      onRemove: () => onChange({ ...state, sort: "relevance" })
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 bg-white border-b border-gray-200">
      <span className="text-xs text-gray-500 mr-1">Active:</span>
      {chips.map((chip, i) => (
        <button
          key={`${chip.group}-${chip.label}`}
          onClick={chip.onRemove}
          className="animate-chip-pop inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded hover:bg-blue-100 transition-colors"
          style={{ animationDelay: `${i * 30}ms` }}
          title={`${chip.group}: ${chip.label} — click to remove`}
        >
          <span className="text-[10px] text-blue-400 font-medium uppercase">{chip.group}</span>
          <span>{chip.label}</span>
          <span className="ml-0.5 text-blue-400 hover:text-blue-700">×</span>
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={() => onChange(DEFAULT_STATE)}
          className="text-xs text-gray-500 hover:text-red-600 underline ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
