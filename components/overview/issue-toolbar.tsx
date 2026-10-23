import Link from "next/link";

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 19 14 12.46 22 3" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8V5L8 1L13 5V8M3 16V19L8 23L13 19V16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IssueToolbar({
  newIssueHref = "/issues/new",
}: {
  newIssueHref?: string;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Issue toolbar"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Search issues"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#E8E8EA] bg-[#FEFEFE] text-[#697181] hover:bg-[#F5F5F6] hover:text-[#17191D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEC] transition-colors"
        >
          <SearchIcon />
        </button>
        <button
          type="button"
          aria-label="Filter issues"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#E8E8EA] bg-[#FEFEFE] text-[#697181] hover:bg-[#F5F5F6] hover:text-[#17191D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEC] transition-colors"
        >
          <FilterIcon />
        </button>
        <button
          type="button"
          aria-label="Sort issues"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#E8E8EA] bg-[#FEFEFE] text-[#697181] hover:bg-[#F5F5F6] hover:text-[#17191D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEC] transition-colors"
        >
          <SortIcon />
        </button>
      </div>

      <Link
        href={newIssueHref}
        aria-label="New issue"
        className="inline-flex items-center gap-2 rounded-full border border-[#2F5BEC] bg-[#FEFEFE] px-4 py-1.5 text-sm font-semibold text-[#2F5BEC] hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEC] transition-colors"
      >
        <PlusIcon />
        New issue
      </Link>
    </div>
  );
}