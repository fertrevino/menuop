"use client";
import { useState } from "react";
import {
  listMenuTemplates,
  buildTemplateMenu,
} from "@/lib/templates/menuTemplates";
import { MenuFormData } from "@/lib/types/menu";

interface TemplateSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: MenuFormData) => void;
  defaultCurrency?: string;
}

export function TemplateSelectionModal({
  open,
  onClose,
  onApply,
  defaultCurrency = "USD",
}: TemplateSelectionModalProps) {
  const templates = listMenuTemplates();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  // Rotating color schemes for visual variety
  const colorSchemes = [
    {
      bar: "bg-emerald-500/80",
      ring: "focus-visible:ring-emerald-400/40",
      hover: "hover:border-emerald-500/70 hover:bg-emerald-600/10",
      selected: "border-emerald-500 shadow-emerald-500/20",
      tag: "bg-emerald-600/20 text-emerald-300",
    },
    {
      bar: "bg-teal-500/80",
      ring: "focus-visible:ring-teal-400/40",
      hover: "hover:border-teal-500/70 hover:bg-teal-600/10",
      selected: "border-teal-500 shadow-teal-500/20",
      tag: "bg-teal-600/20 text-teal-300",
    },
    {
      bar: "bg-amber-500/80",
      ring: "focus-visible:ring-amber-400/40",
      hover: "hover:border-amber-500/70 hover:bg-amber-600/10",
      selected: "border-amber-500 shadow-amber-500/20",
      tag: "bg-amber-600/20 text-amber-300",
    },
    {
      bar: "bg-indigo-500/80",
      ring: "focus-visible:ring-indigo-400/40",
      hover: "hover:border-indigo-500/70 hover:bg-indigo-600/10",
      selected: "border-indigo-500 shadow-indigo-500/20",
      tag: "bg-indigo-600/20 text-indigo-300",
    },
    {
      bar: "bg-rose-500/80",
      ring: "focus-visible:ring-rose-400/40",
      hover: "hover:border-rose-500/70 hover:bg-rose-600/10",
      selected: "border-rose-500 shadow-rose-500/20",
      tag: "bg-rose-600/20 text-rose-300",
    },
  ];
  const filtered = templates.filter(
    (t) =>
      !search.trim() ||
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-850">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#1F8349]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
            Choose a Starter Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4 border-b border-gray-700">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cuisine, tag or name..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
          />
        </div>
        <div className="px-6 pt-4 pb-2 text-xs text-gray-400 uppercase tracking-wide">
          {filtered.length} Template{filtered.length !== 1 && "s"}
        </div>
        <div className="overflow-y-auto px-6 pb-6 space-y-4">
          {filtered.map((t, idx) => {
            const isSelected = selected === t.id;
            const scheme = colorSchemes[idx % colorSchemes.length];
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`group relative w-full text-left pl-4 pr-5 py-4 rounded-xl border grid grid-cols-[6px_1fr] gap-4 transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? `${scheme.selected} bg-gray-800/80 ring-2 ring-offset-0 ${scheme.ring}`
                    : `border-gray-700 bg-gray-800 ${scheme.hover}`
                }`}
              >
                <div
                  className={`h-full w-1.5 rounded-full self-stretch ${scheme.bar} group-hover:scale-y-105 transition-transform`}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium truncate">
                      {t.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold tracking-wide bg-white/10 text-white px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {t.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${scheme.tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              No templates match your search.
            </div>
          )}
        </div>
        <div className="mt-auto border-t border-gray-700 p-4 flex items-center justify-between bg-gray-850/40">
          <div className="text-xs text-gray-400">
            Starter templates are editable after applying.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/60 text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                const data = buildTemplateMenu(selected, defaultCurrency);
                if (data) onApply(data as MenuFormData);
                onClose();
              }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                selected
                  ? "bg-gradient-to-r from-[#1F8349] to-[#2ea358] text-white hover:from-[#176e3e] hover:to-[#248a47]"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
