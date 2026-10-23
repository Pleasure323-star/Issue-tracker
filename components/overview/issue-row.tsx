import Link from "next/link";
import { OverviewVote } from "@/components/overview/overview-vote";
import { formatIssueNumber } from "@/lib/issue-number";
import { formatShortAge } from "@/lib/format";
import { statusLabels } from "@/lib/labels";

export type OverviewIssueRow = {
  id: string;
  number: number;
  title: string;
  platform: string;
  voteCount: number;
  userVoted: boolean;
  commentCount: number;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  createdAt: string;
  reporterName: string | null;
  reporterImage: string | null;
};

function priorityBar(severity: string) {
  const tones: Record<string, { fill: string; label: string }> = {
    low: { fill: "#E8E8EA", label: "Low priority" },
    medium: { fill: "#F57C24", label: "Medium priority" },
    high: { fill: "#F04444", label: "High priority" },
    critical: { fill: "#F04444", label: "Critical priority" },
  };
  const tone = tones[severity] ?? tones.low;
  return (
    <span
      aria-label={tone.label}
      className="flex w-[96px] h-[4px] shrink-0 rounded-full overflow-hidden"
    >
      <span
        className="h-full bg-[#E8E8EA]"
        style={{ width: "100%" }}
      />
      <span
        className="h-full"
        style={{
          background: tone.fill,
          width: severity === "low" ? "25%" : severity === "medium" ? "50%" : "100%",
        }}
      />
    </span>
  );
}

function stageProgress(status: string) {
  const steps = [
    { id: "reported", label: "Reported", active: status === "open" },
    { id: "confirmed", label: "Confirmed", active: status === "in_progress" },
    { id: "ready", label: "Ready", active: status === "resolved" },
    { id: "delivered", label: "Delivered", active: status === "closed" },
  ];

  return (
    <span
      aria-label={`Stage: ${statusLabels[status as keyof typeof statusLabels] ?? status}`}
      className="flex w-[140px] h-[4px] shrink-0 items-center gap-1 overflow-hidden rounded-full border border-[#E8E8EA]"
    >
      {steps.map((step, index) => (
        <span
          key={step.id}
          className={`h-full flex-1 rounded-full transition-colors ${
            step.active ? "bg-[#2F5BEC]" : "bg-[#E8E8EA]"
          }`}
        />
      ))}
    </span>
  );
}

function reporterAvatar({
  name,
  image,
}: {
  name: string | null;
  image: string | null;
}) {
  return (
    <span
      className="flex items-center gap-2 shrink-0"
    >
      <span
        aria-hidden="true"
        className="relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold h-6 w-6 bg-[#FCE7F3] text-[#D9468F] text-[10px]"
      >
        {name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
      </span>
      <span className="sr-only">{name ? `Reporter: ${name}` : "Reporter"}</span>
    </span>
  );
}

export function IssueRow({ issue }: { issue: OverviewIssueRow }) {
  return (
    <li
      className="flex items-center gap-4 px-5 py-4 border-b border-[#E8E8EA] bg-[#FEFEFE] last:border-0 hover:bg-[#FAF6F5] transition-colors duration-150"
    >
      {/* Votes column */}
      <div className="shrink-0 w-[52px]">
        <OverviewVote
          bugId={issue.id}
          voteCount={issue.voteCount}
          voted={issue.userVoted}
        />
      </div>

      {/* Title and metadata column */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/issues/${issue.id}`}
          className="block"
        >
          <h3 className="text-sm font-medium text-[#17191D] leading-snug">
            {issue.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#858A97]">
            <span className="font-semibold">{formatIssueNumber(issue.number)}</span>
            <span aria-hidden="true">·</span>
            <span>{issue.platform}</span>
            {issue.commentCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <span aria-hidden="true">·</span>
                <span>{issue.commentCount} comment{issue.commentCount === 1 ? "" : "s"}</span>
              </span>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>{formatShortAge(issue.createdAt)}</span>
          </p>
        </Link>
      </div>

      {/* Type column */}
      <span className="w-[92px] shrink-0 text-[11px] font-medium text-[#858A97]">
        Bug
      </span>

      {/* Priority column */}
      <span className="w-[96px] shrink-0">{priorityBar(issue.severity)}</span>

      {/* Stage progress column */}
      <span className="w-[140px] shrink-0">{stageProgress(issue.status)}</span>

      {/* Reporter avatar column */}
      <span className="w-[84px] shrink-0">
        {issue.reporterName ? (
          <reporterAvatar name={issue.reporterName} image={issue.reporterImage} />
        ) : (
          <span className="text-[11px] text-[#858A97]">—</span>
        )}
      </span>
    </li>
  );
}

export function IssueTableHeader() {
  return (
    <div className="flex items-center gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#858A97] border-b border-[#E8E8EA] bg-[#F5F5F6]">
      <span className="w-[52px] shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">Issue</span>
      <span className="w-[92px] shrink-0 text-center">Type</span>
      <span className="w-[96px] shrink-0 text-center">Priority</span>
      <span className="w-[140px] shrink-0 text-center">Stage</span>
      <span className="w-[84px] shrink-0 text-center">Reporter</span>
    </div>
  );
}