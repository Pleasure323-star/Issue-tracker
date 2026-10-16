"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { severities, statuses } from "@/lib/validations/bug";
import { severityLabel, statusLabel } from "@/lib/labels";
import {
  BUG_SORT_OPTIONS,
  bugSortLabels,
  parseBugSort,
} from "@/lib/bugs-sort";
import { TagSearchBar } from "@/components/tag-search-bar";

export function BugFilters({
  issueTypes,
  defaultTags = [],
}: {
  issueTypes: { id: string; name: string }[];
  defaultTags?: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/bugs?${qs}` : "/bugs");
  }

  const currentSort = parseBugSort(params.get("sort"));

  return (
    <div className="space-y-4">
      {/* Search bar — top block line */}
      <TagSearchBar
        key={defaultTags.join(",") || "none"}
        issueTypes={issueTypes}
        defaultQuery={params.get("q") ?? ""}
        defaultTags={defaultTags}
        update={update}
      />
      {/* Status / Severity / Sort — separate block line below */}
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end sm:gap-3">
        <div className="w-full sm:w-auto min-w-[140px]">
          <label
            htmlFor="show"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Show
          </label>
          <select
            id="show"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:w-auto"
            value={params.get("show") ?? ""}
            onChange={(event) => update("show", event.target.value)}
          >
            <option value="">All issues</option>
            <option value="assigned">Assigned to me</option>
            <option value="reported">Reported by me</option>
          </select>
        </div>
        <div className="w-full sm:w-auto min-w-[140px]">
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Status
          </label>
          <select
            id="status"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:w-auto"
            value={params.get("status") ?? ""}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="">All</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto min-w-[140px]">
          <label
            htmlFor="severity"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Severity
          </label>
          <select
            id="severity"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:w-auto"
            value={params.get("severity") ?? ""}
            onChange={(event) => update("severity", event.target.value)}
          >
            <option value="">All</option>
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {severityLabel[severity]}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto min-w-[140px]">
          <label
            htmlFor="sort"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Sort
          </label>
          <select
            id="sort"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:w-auto"
            value={currentSort}
            onChange={(event) => update("sort", event.target.value)}
          >
            {BUG_SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {bugSortLabels[option]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}