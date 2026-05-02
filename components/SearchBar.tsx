"use client";

import { useEffect, useState } from "react";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <form
      className="flex-1 flex"
      onSubmit={e => {
        e.preventDefault();
        onChange(draft);
      }}
    >
      <div className="flex-1 flex rounded overflow-hidden border-2 border-amber-400 focus-within:border-amber-500 transition-colors">
        <input
          type="search"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Search travel gear…"
          className="flex-1 px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 transition-colors"
          aria-label="Search"
        >
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
