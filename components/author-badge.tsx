/**
 * Marks the ticket reporter. Text + symbol so it is not color-only.
 * Styling mirrors AdminBadge for a consistent name-badge row.
 */
export function AuthorBadge() {
  return (
    <span
      role="status"
      aria-label="Ticket author"
      title="Ticket author"
      className="inline-flex items-center gap-0.5 rounded border border-sky-800/40 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-950"
    >
      <span aria-hidden="true" className="leading-none">
        ✎
      </span>
      Author
    </span>
  );
}
