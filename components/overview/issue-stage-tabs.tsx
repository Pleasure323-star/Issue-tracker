"use client";

type Stage = {
  id: string;
  label: string;
  count: number;
  icon?: "blue" | "orange" | "green" | "red";
};

const STAGES: Stage[] = [
  { id: "inbox", label: "Inbox", count: 42 },
  { id: "open", label: "Open", count: 612 },
  { id: "in_progress", label: "In progress", count: 87, icon: "blue" },
  { id: "review", label: "Review", count: 31, icon: "orange" },
  { id: "approved", label: "Approved", count: 125, icon: "green" },
  { id: "attention", label: "Attention", count: 12, icon: "red" },
];

function StatusDot({ icon }: { icon: "blue" | "orange" | "green" | "red" }) {
  const colors: Record<string, string> = {
    blue: "bg-[#2F5BEC]",
    orange: "bg-[#F57C24]",
    green: "bg-[#12A05C]",
    red: "bg-[#F04444]",
  };
  return (
    <span
      aria-hidden="true"
      className={`h-1.5 w-1.5 rounded-full ${colors[icon]}`}
    />
  );
}

export function IssueStageTabs({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Issue stages"
      className="inline-flex items-center gap-1 rounded-full bg-[#F2F2F3] px-1 py-1.5"
    >
      {STAGES.map((stage) => {
        const isSelected = selectedId === stage.id;
        return (
          <button
            key={stage.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={`${stage.label}, ${stage.count} issues`}
            onClick={() => onSelect(stage.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isSelected
                ? "bg-[#2F5BEC] text-white"
                : "text-[#697181] hover:text-[#17191D] hover:bg-white"
            }`}
          >
            {stage.icon && <StatusDot icon={stage.icon} />}
            <span className="shrink-0 truncate">{stage.label}</span>
            <span className="shrink-0 text-[11px] tabular-nums">
              {stage.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type { Stage };