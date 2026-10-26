# Goal decision room concept

This prototype is implemented in the Ziki app at `/projects/decision-room-demo`, reached from **Projects**. It uses Ziki's real signed-in layout, navigation, typography, and color tokens. The example project, people, tests, dates, and estimates are illustrative. Approvals and updates affect only the browser state; no Ziki record is changed.

The earlier [hosted concept preview](https://ziki-goal-decisions.raiseedafrica.chatgpt.site/) shows the same journey without a Ziki login. This repository route is the integration in the current Ziki app.

## User problem

An issue-level escalation can tell a project owner that an agent is blocked. It does not necessarily explain the effect on a larger goal or make the date/scope trade-off clear. The owner needs a short evidence-backed decision, while agents can handle the follow-through. The team then needs an accurate update without making the owner write it from scratch.

The scenario is a Friday mobile onboarding demo. Two example testers reproduce an Android sign-in timeout. The owner compares three directions: fix first and move the date, keep Friday with reduced scope, or pause. The impact panel previews the target, scope, outlook, and agent next steps. Approval revises the displayed goal. The agent-assisted update is drafted from those example facts; the owner can edit it before publishing to the local preview.

This concentrates human attention on the trade-off, not every small agent action. It was informed by Ziki's existing goals, escalations, independent test verdicts, and merger gates, plus [Linear's project updates](https://linear.app/docs/initiative-and-project-updates). It is a design proposal rather than a production workflow or live AI integration.

These screenshots are genuine browser captures of this route in a local production build:

- [Desktop decision room](assets/goal-decision-room-1440.png)
- [Phone decision room](assets/goal-decision-room-390.png)
- [Approved direction and edited team update](assets/goal-decision-room-update.png)

## Review locally

Follow the repository's `README.md` for pnpm, PostgreSQL, migrations, and a demo account. Do not reseed a database with real accounts. Run `pnpm dev`, sign in, open **Projects**, and choose **Preview the goal decision room**. Try all three directions, inspect the test evidence, approve one, draft an update, edit it, and publish it in the demo. **Reset demo** clears the local state.

For a production version, evidence should link to real issue and verdict records; an approved decision should persist with the goal and permissions; agent work should update the goal and emit a reviewable update draft; and publication should have an audit trail. The prototype deliberately does none of those external writes.
