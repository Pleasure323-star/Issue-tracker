"use client";

import { useState } from "react";

type Direction = "fix" | "trim" | "pause";
type Style = "concise" | "detailed";

const directions: Record<Direction, {
  label: string;
  explanation: string;
  target: string;
  scope: string;
  outlook: string;
  goal: string;
  choice: string;
  steps: string[];
}> = {
  fix: {
    label: "Fix the blocker first",
    explanation: "Keep full onboarding. Move the demo to Monday so the fix can be independently tested.",
    target: "Monday, 2 Nov",
    scope: "Full onboarding",
    outlook: "Recoverable after retest",
    goal: "Full onboarding moves to Monday",
    choice: "Keep full onboarding and move the demo target to Monday, 2 November.",
    steps: ["Patch the Android timeout", "Retest the revised build independently", "Send the verified fix for merger review"],
  },
  trim: {
    label: "Keep Friday, trim scope",
    explanation: "Demo the tested paths on Friday. Defer Android sign-in and disclose the gap.",
    target: "Friday, 30 Oct",
    scope: "Android sign-in deferred",
    outlook: "On time, reduced scope",
    goal: "Friday demo continues with reduced scope",
    choice: "Keep Friday's demo for the tested paths and defer Android sign-in.",
    steps: ["Remove Android sign-in from the demo checklist", "Retest the paths still in scope", "Keep the Android issue open for a later release"],
  },
  pause: {
    label: "Pause the release",
    explanation: "Investigate the failure before committing to a new date.",
    target: "To be reset",
    scope: "Full onboarding",
    outlook: "Paused for investigation",
    goal: "Onboarding release is paused",
    choice: "Pause the release until the Android failure is understood and a new target is approved.",
    steps: ["Investigate the timeout", "Document a reproducible test", "Return with a new target for owner approval"],
  },
};

function proposedUpdate(direction: Direction, style: Style) {
  const item = directions[direction];
  const lead = "Two example testers reproduced an Android sign-in timeout on weak networks. iOS sign-up and session restore passed.";
  if (style === "detailed") {
    return `Zedu Mobile onboarding update\n\n${lead}\n\nDecision: ${item.choice}\n\nTarget: ${item.target}. Scope: ${item.scope}.\n\nNext steps:\n• ${item.steps.join("\n• ")}\n\nThe goal is not ready until the required independent checks and merger review pass.`;
  }
  return `Zedu Mobile onboarding update\n\n${lead}\n\nDecision: ${item.choice}\n\nNext: ${item.steps[0]}. We will update the team after independent testing and review.`;
}

const card = "rounded-[20px] border border-zk-border bg-zk-surface p-4 sm:p-6";

export function DecisionRoomDemo() {
  const [selected, setSelected] = useState<Direction>("fix");
  const [approved, setApproved] = useState<Direction | null>(null);
  const [style, setStyle] = useState<Style>("concise");
  const [draft, setDraft] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [replacePending, setReplacePending] = useState(false);
  const [posted, setPosted] = useState<string | null>(null);
  const [error, setError] = useState("");

  const preview = directions[selected];
  const chosen = approved ? directions[approved] : null;

  function approve() {
    setApproved(selected);
    setDraft(null);
    setSuggestion(null);
    setReplacePending(false);
    setPosted(null);
    setError("");
    document.getElementById("project-update")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function generateDraft() {
    if (!approved || approved !== selected) {
      setError("Approve this direction first.");
      document.getElementById("decision-options")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const next = proposedUpdate(approved, style);
    if (draft !== null && suggestion !== null && draft !== suggestion && !replacePending) {
      setReplacePending(true);
      return;
    }
    setDraft(next);
    setSuggestion(next);
    setReplacePending(false);
    setError("");
  }

  function publish() {
    if (approved !== selected) {
      setError("Approve the selected direction before sharing its update.");
      return;
    }
    if (!draft || draft.trim().length < 30) {
      setError("Write at least 30 characters before sharing the update.");
      return;
    }
    setPosted(draft.trim());
    setError("");
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zk-info-bg bg-zk-tint px-4 py-3 text-xs text-zk-text2">
        <p><strong className="text-zk-text">Interactive concept</strong> · Example project, people, tests and estimates. Nothing is saved to Ziki.</p>
        <button type="button" className="font-semibold text-zk-accent hover:underline" onClick={() => { setSelected("fix"); setApproved(null); setDraft(null); setSuggestion(null); setReplacePending(false); setPosted(null); setStyle("concise"); setError(""); }}>Reset demo</button>
      </div>

      <header className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-zk-accent">Zedu Mobile · release goal</p>
        <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-zk-text sm:text-4xl">
          {chosen ? chosen.goal : "Android sign-in puts Friday's demo at risk"}
        </h1>
        <p className="max-w-2xl text-sm text-zk-text2">
          {chosen ? "A direction is approved. Agents can now work from the revised plan." : "Your agents found a blocker. Choose whether to move the date, trim scope, or pause."}
        </p>
        <a href="#decision-options" className="inline-block text-sm font-semibold text-zk-accent hover:underline sm:hidden">Review the options ↓</a>
      </header>

      <section className={card} aria-label="Release goal">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-zk-accent">The goal</p>
            <h2 className="mt-1 text-lg font-bold text-zk-text">{chosen ? chosen.goal : "Mobile sign-up and sign-in ready for the Friday demo"}</h2>
          </div>
          <span className="rounded-full bg-zk-warn-bg px-3 py-1 text-xs font-bold text-zk-warn-fg">{chosen ? "Revised plan" : "Needs your decision"}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-lg bg-zk-ok-bg px-3 py-1.5 text-zk-ok-fg">✓ iOS sign-up passed</span>
          <span className="rounded-lg bg-zk-ok-bg px-3 py-1.5 text-zk-ok-fg">✓ Session restore passed</span>
          <span className="rounded-lg bg-zk-warn-bg px-3 py-1.5 text-zk-warn-fg">{approved === "trim" ? "Android sign-in deferred" : "Android sign-in blocked"}</span>
        </div>
        <p className="mt-4 border-t border-zk-divider pt-3 text-xs text-zk-muted">{approved === "trim" ? "2 of 2 checks in Friday's revised demo scope" : "2 of 3 original acceptance checks"}</p>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(285px,1fr)]">
        <section id="decision-options" className={`${card} scroll-mt-24`} aria-labelledby="decision-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-zk-accent">Human decision · 1 of 1</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${approved === selected ? "bg-zk-ok-bg text-zk-ok-fg" : "bg-zk-warn-bg text-zk-warn-fg"}`}>{approved === selected ? "Approved" : approved ? "New option not approved" : "Waiting on you"}</span>
          </div>
          <h2 id="decision-heading" className="mt-5 text-2xl font-extrabold tracking-tight text-zk-text">Choose what happens next</h2>
          <p className="mt-2 text-sm text-zk-text2">Two example testers reproduced an Android sign-in timeout on weak networks.</p>
          <details className="mt-5 rounded-xl border border-zk-border bg-zk-tint p-4 text-sm text-zk-text2">
            <summary className="cursor-pointer font-semibold text-zk-accent">See test evidence · example issue DEMO-17</summary>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Dara: sign-in did not complete during a poor-network Android run.</li>
              <li>Femi: reproduced the timeout and suggested checking the retry path.</li>
            </ul>
            <p className="mt-3 text-xs text-zk-muted">Illustrative findings for this concept, not live Ziki tests.</p>
          </details>

          <fieldset className="mt-6 space-y-3">
            <legend className="mb-3 text-sm font-bold text-zk-text">Which trade-off matters most?</legend>
            {(Object.keys(directions) as Direction[]).map((key) => {
              const option = directions[key];
              return (
                <label key={key} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${selected === key ? "border-electric-blue bg-zk-tint" : "border-zk-border hover:border-electric-blue"}`}>
                  <input type="radio" name="release-direction" value={key} checked={selected === key} onChange={() => { setSelected(key); setError(""); }} className="mt-1 accent-electric-blue" />
                  <span className="space-y-1">
                    <span className="block font-bold text-zk-text">{option.label}{key === "fix" ? <span className="ml-2 rounded-full bg-zk-info-bg px-2 py-0.5 text-[10px] uppercase text-zk-info-fg">Agent recommends</span> : null}</span>
                    <span className="block text-sm text-zk-text2">{option.explanation}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zk-divider pt-5">
            <button type="button" onClick={approve} disabled={approved === selected} className="rounded-lg bg-electric-blue-strong px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55">{approved === selected ? "Direction approved" : "Approve revised direction"}</button>
            <span className="text-xs text-zk-muted">Agents follow the approved plan; this demo makes no external changes.</span>
          </div>
        </section>

        <aside className={`${card} space-y-4`} aria-label="Impact preview">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-zk-accent">If you choose this</p>
            <h2 className="mt-1 text-xl font-bold text-zk-text">Impact on the goal</h2>
          </div>
          <dl className="divide-y divide-zk-divider rounded-xl border border-zk-border text-sm">
            <div className="flex justify-between gap-4 p-3"><dt className="text-zk-muted">Target</dt><dd className="text-right font-semibold text-zk-text">{preview.target}</dd></div>
            <div className="flex justify-between gap-4 p-3"><dt className="text-zk-muted">Scope</dt><dd className="text-right font-semibold text-zk-text">{preview.scope}</dd></div>
            <div className="flex justify-between gap-4 p-3"><dt className="text-zk-muted">Outlook</dt><dd className="text-right font-semibold text-zk-text">{preview.outlook}</dd></div>
          </dl>
          <div>
            <h3 className="text-sm font-bold text-zk-text">What agents do next</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-zk-text2">{preview.steps.map(step => <li key={step}>{step}</li>)}</ol>
          </div>
          <p className="rounded-lg bg-zk-tint p-3 text-xs text-zk-text2">You decide the trade-off. Independent testing and merger review still gate the release.</p>
        </aside>
      </div>

      <section id="project-update" className="scroll-mt-24 space-y-4" aria-labelledby="update-heading">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zk-accent">Agent-assisted project update</p>
          <h2 id="update-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-zk-text">Tell the team what changed</h2>
          <p className="mt-1 text-sm text-zk-text2">Nia drafts from the example evidence and your decision. You edit before sharing.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className={`${card} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={generateDraft} className="rounded-lg border border-zk-border bg-zk-tint px-4 py-2 text-sm font-bold text-zk-accent hover:opacity-80">{replacePending ? "Replace edited draft" : draft ? "Regenerate draft" : "Draft with agent"}</button>
              <div role="group" aria-label="Update detail" className="flex rounded-lg border border-zk-border p-1 text-xs">
                {(["concise", "detailed"] as Style[]).map(value => <button key={value} type="button" aria-pressed={style === value} onClick={() => setStyle(value)} className={`rounded px-2 py-1 font-semibold ${style === value ? "bg-zk-tint text-zk-accent" : "text-zk-muted"}`}>{value === "concise" ? "Concise" : "More detail"}</button>)}
              </div>
            </div>
            {replacePending ? <p role="status" className="text-sm text-zk-warn-fg">This will replace your edits. Select “Replace edited draft” to continue.</p> : null}
            {draft !== null ? (
              <div className="space-y-2">
                <label htmlFor="project-update-draft" className="text-sm font-bold text-zk-text">Review and edit the draft</label>
                <textarea id="project-update-draft" value={draft} onChange={event => { setDraft(event.target.value); setReplacePending(false); setError(""); }} maxLength={2000} rows={10} className="w-full rounded-xl border border-zk-border bg-zk-surface p-3 text-sm text-zk-text focus:outline-2 focus:outline-electric-blue" />
                <p className="text-xs text-zk-muted">Example agent suggestion · {draft.length}/2000 characters</p>
                <button type="button" onClick={publish} className="rounded-lg bg-electric-blue-strong px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">Publish in demo</button>
              </div>
            ) : <p className="text-sm text-zk-muted">Approve a direction, then ask Nia for a draft.</p>}
            {error ? <p role="alert" className="text-sm font-medium text-zk-bad-fg">{error}</p> : null}
          </div>
          <div className={card} aria-live="polite">
            <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-zk-text">Team update preview</h3><span className="rounded-full bg-zk-chip px-2 py-1 text-xs text-zk-muted">{posted ? "Published in demo" : "No update yet"}</span></div>
            {posted ? <div className="mt-5 space-y-3"><p className="text-xs font-semibold text-zk-text">Amina · project owner</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-zk-text2">{posted}</p><p className="border-t border-zk-divider pt-3 text-xs text-zk-muted">Reviewed by the human owner · example only</p></div> : <p className="mt-10 text-center text-sm text-zk-muted">Nothing shared yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
