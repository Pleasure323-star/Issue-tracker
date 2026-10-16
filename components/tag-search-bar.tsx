"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getIssueTypeBadgeClass } from "@/lib/issue-types";

type IssueType = { id: string; name: string };

/**
 * Reddit-style tag search bar.
 *
 * - Typing in the input shows matching issue-type (tag) suggestions in a
 *   dropdown.
 * - Clicking (or pressing Enter on) a suggestion selects the tag: it is added
 *   to `selectedTags`, rendered as a pill below the input, and the query is
 *   cleared.
 * - The free-text `query` is submitted (via `update("q", ...)`) on Enter when
 *   no suggestion is highlighted, or on blur.
 * - `update("tag", ...)` is called whenever the selected tag set changes so the
 *   filter stays in the URL.
 * - Clicking outside the input closes the dropdown.
 * - A clear (×) button appears only when text has been entered.
 */
export function TagSearchBar({
  issueTypes,
  defaultQuery = "",
  defaultTags = [],
  update,
  className = "",
}: {
  issueTypes: IssueType[];
  defaultQuery?: string;
  defaultTags?: string[];
  update: (key: string, value: string) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultTags);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const ignoringBlur = useRef(false);

  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 0;

  const suggestions = issueTypes.filter(
    (type) =>
      normalizedQuery === "" || type.name.toLowerCase().includes(normalizedQuery),
  );

  const setOpenState = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setHighlighted(-1);
  }, []);

  // Close dropdown when clicking outside the search bar container.
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenState(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [setOpenState]);

  const selectTag = useCallback(
    (name: string) => {
      if (!name || selectedTags.includes(name)) {
        setQuery("");
        setOpenState(false);
        return;
      }
      const nextTags = [...selectedTags, name];
      setSelectedTags(nextTags);
      setQuery("");
      setOpenState(false);
      update("tag", nextTags.join(","));
    },
    [selectedTags, update, setOpenState],
  );

  const removeTag = useCallback(
    (name: string) => {
      setSelectedTags((prev) => prev.filter((t) => t !== name));
      update(
        "tag",
        [...new Set(selectedTags.filter((t) => t !== name))].join(","),
      );
    },
    [selectedTags, update],
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setOpenState(false);
    inputRef.current?.focus();
  }, [setOpenState]);

  const submitQuery = useCallback(() => {
    const trimmed = query.trim();
    setOpenState(false);
    if (trimmed.length > 0) {
      update("q", trimmed);
    }
  }, [query, update, setOpenState]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setQuery(value);
      if (!open) setOpenState(true);
    },
    [open, setOpenState],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setOpenState(false);
        return;
      }

      if (!open) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlighted((prev) =>
          prev >= suggestions.length - 1 ? 0 : prev + 1,
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1,
        );
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const active = suggestions[highlighted];
        if (active) {
          selectTag(active.name);
        } else {
          submitQuery();
        }
        return;
      }
    },
    [open, suggestions, highlighted, selectTag, submitQuery, setOpenState],
  );

  const handleBlur = useCallback(() => {
    if (ignoringBlur.current) {
      ignoringBlur.current = false;
      return;
    }
    setTimeout(() => {
      setOpenState(false);
      submitQuery();
    }, 120);
  }, [submitQuery, setOpenState]);

  const handleMouseDown = useCallback(() => {
    ignoringBlur.current = true;
  }, []);

  const selectedPills = selectedTags;

  return (
    <div ref={containerRef} className={`col-span-full min-w-0 ${className}`}>
      <div className="relative mx-auto max-w-sm">
        <input
          ref={inputRef}
          id="tag-search"
          defaultValue={defaultQuery}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpenState(true)}
          onBlur={handleBlur}
          onMouseDown={handleMouseDown}
          autoComplete="off"
          placeholder="Search title, description or tag (design, marketing…)"
          className={`w-full rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 ${
            hasQuery ? "pr-10" : ""
          }`}
        />

        {hasQuery && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              clearSearch();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Clear search"
            title="Clear search"
          >
            ×
          </button>
        )}

        {open && suggestions.length > 0 && (
          <div
            className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-b-lg border border-slate-300 border-t-0 bg-white shadow-lg"
          >
            {suggestions.map((type, index) => {
              const isHighlighted = index === highlighted;
              return (
                <button
                  key={type.id}
                  type="button"
                  onMouseDown={handleMouseDown}
                  onClick={() => selectTag(type.name)}
                  className={`w-full text-left px-3 py-2 text-sm transition ${
                    isHighlighted
                      ? "bg-teal-50 text-teal-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {type.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedPills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedPills.map((name) => {
            const badgeClass = getIssueTypeBadgeClass(name);
            return (
              <span
                key={name}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
              >
                {name}
                <button
                  type="button"
                  aria-label={`Remove ${name} tag`}
                  onMouseDown={handleMouseDown}
                  onClick={() => removeTag(name)}
                  className="rounded-md p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}