"use client";

import { Search, X } from "lucide-react";
import { useRef, useEffect } from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search tools...",
  className = "",
  onKeyDown,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full h-12 pl-11 pr-10 rounded-xl bg-[rgba(7,15,35,0.68)] backdrop-blur-2xl border border-[rgba(148,163,184,0.22)] text-[#f8fafc] placeholder:text-slate-500 focus:outline-none focus:border-[rgba(56,189,248,0.5)] transition-all"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-200"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
      <kbd className="absolute right-12 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[rgba(148,163,184,0.1)] text-slate-500">
        ⌘K
      </kbd>
    </div>
  );
}
