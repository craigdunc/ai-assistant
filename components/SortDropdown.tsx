"use client";

import type { SortKey } from "@/lib/types";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Avg. Customer Review" },
  { value: "newest", label: "Newest Arrivals" }
];

export function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-gray-600 text-xs">Sort by:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortKey)}
        className="border border-gray-300 rounded px-2 py-1 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
      >
        {OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
