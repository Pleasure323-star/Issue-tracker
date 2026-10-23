# Ziki Issues — Design System Specification

**Reference status:** Screenshot-matched first pass based on the supplied Ziki Issues UI screenshot. The large interface elements, colors, density, panel spacing, stage selector, issue table, vote controls, priority bars, progress tracks and avatars have been recreated as editable Figma layers. Small rail/type icons use typographic glyph approximations where the screenshot did not provide transferable source assets; replace those glyphs with the production icon set for an exact asset-level match.

## Figma files

- **Master component library:** [SaaS Design System — Master Library](https://www.figma.com/design/VvEehhuYo7KR9vkACyZvZL)
- **Reference screen:** [SaaS UI Kit — Product Examples](https://www.figma.com/design/TpLKI3RIbzMMkMAdv63sIM)
- **Workspace:** HNG 15

The master library now has eight pages, including **07 — Ziki Issues Components**. The companion screen is a native, editable Figma composition, not a flattened screenshot. The companion file has local stage-tab, toolbar-action and issue-row masters so that its composition can be edited without a library import. These local masters are not yet native cross-file linked instances; publish the master library through Figma’s library controls and switch local copies to linked instances if you need ongoing shared updates.

---

## 1. Reference design language

The interface is a compact issue-tracking workspace with a warm dark rail, white top bar, light grey canvas and a broad white content panel. The hierarchy is deliberately quiet: medium-weight headings, subdued metadata, hairline separators, rounded toolbar controls, and status color used only where it communicates state.

### Layout reference

The Figma composition frame is **1600 × 850 px**.

| Region | Reference dimensions / treatment |
|---|---|
| App rail | 60 px wide, deep plum background |
| Workspace top bar | 66 px high, near-white surface, subtle bottom divider |
| Main canvas | Light neutral grey |
| Issues panel | 1468 × 740 px, 24 px corner radius, inset from the canvas |
| Page heading | 23 px bold, followed by 14 px supporting copy |
| Toolbar actions | 40 px circular outlined search, filter and sort controls; separate “New issue” action |
| Stage selector | Rounded, muted-grey group; the active stage uses blue fill and white content |
| Issue table | Compact header, three 76 px reference rows, thin separators, muted footer |
| Issue row columns | Votes, issue title and metadata, type, priority, stage progress, reporter avatar |

### Workspace and stage labels

The reference status selector uses these labels and sample counts. Counts are reference content for the mockup, not hard-coded product logic.

| Stage | Sample count | Visual treatment |
|---|---:|---|
| Inbox | 42 | Selected blue pill |
| Open | 612 | Neutral |
| In progress | 87 | Blue status icon |
| Review | 31 | Orange status icon |
| Approved | 125 | Green status icon |
| Attention | 12 | Red status icon |

### Reference issue rows

1. **Notification badge count doesn’t clear after reading all mentions** — `#64`, Mobile, 1d ago, 22 votes.
2. **Add confirmation step before deleting a channel** — `#151`, Web, 2d ago, 8 votes.
3. **Read receipts setting does not sync between desktop and mobile** — `#139`, Mobile, 3d ago, 7 votes.

The metadata, counts, dates and initials are fixture content copied for visual alignment. Bind them to real issue records in the product.

---

## 2. Color foundations

The `Primitives` collection contains **52 variables**. It includes the original palette families calibrated to the screenshot plus plum, warm-neutral and named status colors. Use semantic tokens in components whenever possible; use raw primitives only when a component needs a distinct palette value.

### Core reference tokens

| Token / role | Value | Usage |
|---|---|---|
| `plum/900` / rail | `#311916` | Main application rail |
| `plum/700` | `#3B2421` | Deeper secondary plum |
| `plum/500` / rail hover | `#513431` | Selected / hover rail tile |
| `warm/50` | `#FAF6F5` | Warm supporting neutral |
| `warm/100` | `#EDE2E0` | Warm border / emphasis |
| `neutral/0` | `#FEFEFE` | Surface white |
| `neutral/50` | `#F5F5F6` | Workspace canvas |
| `neutral/100` | `#F2F2F3` | Quiet chips and grouped control background |
| `neutral/200` | `#E8E8EA` | Table rules, borders, control outlines |
| `neutral/300` | `#D7D8DC` | Stronger neutral borders |
| `neutral/400` | `#A3A6B0` | Disabled and low-emphasis iconography |
| `neutral/500` | `#858A97` | Tertiary text and metadata |
| `neutral/600` | `#697181` | Secondary text |
| `neutral/700` | `#444A55` | Strong secondary/icon tone |
| `neutral/800` | `#282C33` | Dark neutral |
| `neutral/900` | `#17191D` | Primary text |
| `neutral/950` | `#111216` | Deep dark surface |
| `blue/50` | `#EEF2FF` | Pale selection surface |
| `blue/100` | `#DCE5FF` | Soft blue surface |
| `blue/200` | `#BDCCFF` | Light blue emphasis |
| `blue/300` | `#91ACFF` | Dark-mode blue support |
| `blue/400` | `#6487FF` | Blue support |
| `blue/500` | `#2F5BEC` | Reference selected/primary blue |
| `blue/600` | `#2F5BEC` | Reference primary action blue |
| `blue/700` | `#2447CF` | Strong blue text/pressed blue |
| `blue/800` | `#1D39A8` | Deeper blue |
| `blue/900` | `#172B7A` | Dark-mode blue |
| `status/blue` | `#2F5BEC` | In-progress / informational state |
| `status/orange` | `#F57C24` | Review / warning / vote highlight |
| `status/green` | `#12A05C` | Approved / success |
| `status/red` | `#F04444` | Attention / urgent state |
| `status/purple` | `#D9468F` | Reporter avatar accent |
| `green/50` | `#ECFDF3` | Pale success surface |
| `green/100` | `#D1FADF` | Light green surface |
| `green/500` | `#12A05C` | Success |
| `green/600` | `#079455` | Strong success |
| `green/700` | `#067647` | Deep success |
| `amber/50` | `#FFF7ED` | Pale warm status surface |
| `amber/100` | `#FFE7CF` | Soft orange surface |
| `amber/500` | `#F57C24` | Warning / review |
| `amber/600` | `#E56817` | Strong warning |
| `amber/700` | `#B94A10` | Deep warning |
| `red/50` | `#FFF0F0` | Pale danger surface |
| `red/100` | `#FFDADA` | Light danger surface |
| `red/500` | `#F04444` | Attention / error |
| `red/600` | `#E52E36` | Strong danger |
| `red/700` | `#C5222A` | Deep danger |
| `purple/50` | `#FDF2F8` | Pale purple surface |
| `purple/100` | `#FCE7F3` | Avatar and accent surface |
| `purple/500` | `#D9468F` | Purple accent |
| `purple/600` | `#C92F7D` | Strong purple |
| `purple/700` | `#A61B63` | Deep purple |

### Semantic `Color` collection

The `Color` collection contains **32 variables** with **Light** and **Dark** modes.

| Semantic token | Light mode | Dark mode |
|---|---|---|
| `color/bg/page` | `neutral/50` | `neutral/950` |
| `color/bg/surface` | `neutral/0` | `neutral/900` |
| `color/bg/surface-muted` | `neutral/100` | `neutral/800` |
| `color/bg/brand` | `blue/600` | `blue/500` |
| `color/bg/brand-hover` | `blue/700` | `blue/400` |
| `color/bg/success` | `green/50` | `green/700` |
| `color/bg/warning` | `amber/50` | `amber/700` |
| `color/bg/danger` | `red/50` | `red/700` |
| `color/bg/rail` | `plum/900` | `neutral/950` |
| `color/bg/rail-hover` | `plum/500` | `neutral/800` |
| `color/bg/selected` | `blue/50` | `blue/900` |
| `color/bg/table-header` | `neutral/50` | `neutral/900` |
| `color/bg/chip` | `neutral/100` | `neutral/800` |
| `color/text/primary` | `neutral/900` | `neutral/50` |
| `color/text/secondary` | `neutral/600` | `neutral/300` |
| `color/text/tertiary` | `neutral/500` | `neutral/400` |
| `color/text/on-brand` | `neutral/0` | `neutral/950` |
| `color/text/brand` | `blue/700` | `blue/300` |
| `color/text/selected` | `blue/700` | `blue/200` |
| `color/text/success` | `green/700` | `green/100` |
| `color/text/warning` | `amber/700` | `amber/100` |
| `color/text/danger` | `red/700` | `red/100` |
| `color/border/default` | `neutral/200` | `neutral/700` |
| `color/border/strong` | `neutral/400` | `neutral/500` |
| `color/border/brand` | `blue/500` | `blue/400` |
| `color/icon/primary` | `neutral/700` | `neutral/200` |
| `color/icon/secondary` | `neutral/500` | `neutral/400` |
| `color/status/blue` | `status/blue` | `blue/300` |
| `color/status/orange` | `status/orange` | `amber/100` |
| `color/status/green` | `status/green` | `green/100` |
| `color/status/red` | `status/red` | `red/100` |
| `color/status/purple` | `status/purple` | `purple/100` |

### CSS starting point

```css
:root {
  --color-bg-page: #F5F5F6;
  --color-bg-surface: #FEFEFE;
  --color-bg-surface-muted: #F2F2F3;
  --color-bg-brand: #2F5BEC;
  --color-bg-rail: #311916;
  --color-bg-rail-hover: #513431;
  --color-bg-selected: #EEF2FF;
  --color-border-default: #E8E8EA;
  --color-text-primary: #17191D;
  --color-text-secondary: #697181;
  --color-text-tertiary: #858A97;
  --color-status-blue: #2F5BEC;
  --color-status-orange: #F57C24;
  --color-status-green: #12A05C;
  --color-status-red: #F04444;
  --color-status-purple: #D9468F;
}
```

---

## 3. Typography, spacing, sizing and elevation

### Typography

The library uses **Inter**. The screenshot’s information hierarchy relies on compact text, not oversized typography.

| Text style | Size | Line height | Intended usage |
|---|---:|---:|---|
| Display / Large | 48 px | 56 px | Marketing / hero examples, not issue rows |
| Heading / H1 | 36 px | 44 px | Large page hierarchy |
| Heading / H2 | 30 px | 38 px | Secondary hierarchy |
| Heading / H3 | 24 px | 32 px | Section headings |
| Heading / H4 | 20 px | 28 px | Card/section title |
| Body / Large | 18 px | 28 px | Lead copy |
| Body / Default | 16 px | 24 px | General body text |
| Body / Small | 14 px | 20 px | Screen descriptions and row titles |
| Label / Default | 14 px | 20 px | Buttons and field labels |
| Label / Small | 12 px | 16 px | Status selectors, compact UI |
| Caption | 12 px | 16 px | Low-priority helper content |

Reference-screen overrides: page title about **23 px bold**, issue title **14 px medium**, metadata **11 px**, compact stage labels **13 px**, and table headers around **11 px**.

### Spacing tokens

The `Spacing` collection contains 11 float variables:

| Token | Value |
|---|---:|
| `spacing/2xs` | 2 px |
| `spacing/xs` | 4 px |
| `spacing/sm` | 8 px |
| `spacing/md` | 12 px |
| `spacing/lg` | 16 px |
| `spacing/xl` | 20 px |
| `spacing/2xl` | 24 px |
| `spacing/3xl` | 32 px |
| `spacing/4xl` | 40 px |
| `spacing/5xl` | 48 px |
| `spacing/6xl` | 64 px |

### Radius tokens

The `Radius` collection contains 8 variables: `radius/none` 0, `radius/xs` 2, `radius/sm` 4, `radius/md` 8, `radius/lg` 12, `radius/xl` 16, `radius/2xl` 24, and `radius/full` 9999.

### Sizing tokens

The `Sizing` collection contains 8 variables: small/medium/large controls at 32/40/48 px; small/medium/large icons at 16/20/24 px; a 256 px sidebar reference; and a 64 px topbar reference. The Ziki screen mockup uses a 60 px rail and 66 px app header to follow the supplied image rather than generic sizing defaults.

### Elevation

The master includes `Elevation / 1`, `Elevation / 2`, and `Elevation / 3`. The supplied reference predominantly uses flat surfaces and fine borders; use elevation sparingly, mainly for overlays or floating menus.

---

## 4. Component library inventory

The master Figma library has **50 top-level component assets / sets** and **203 variant or standalone component entries** across the component pages below. Variants are editable Figma component variants; they are visual states and patterns, not fully wired application interactions.

### `02 — Actions & Inputs` (12 assets)

| Component | Variants | Notes |
|---|---:|---|
| Button | 18 | Small / medium / large; primary / secondary / ghost; default / disabled |
| Icon Button | 18 | Three sizes, primary / secondary, default / focused / disabled |
| Text Field | 10 | Small / medium; default, focused, filled, disabled, error |
| Text Area | 5 | Default, focused, filled, disabled, error |
| Select Field | 5 | Default, open, filled, disabled, error |
| Search Field | 3 | Default, focused, filled |
| Date Picker Field | 4 | Default, selected, disabled, error |
| Checkbox | 5 | Unchecked, checked, indeterminate, disabled, error |
| Radio | 4 | Default, selected, disabled, error |
| Switch | 3 | Off, on, disabled |
| Segmented Control | 3 | Overview, activity, members examples |
| Status Badge | 6 | Neutral, brand, success, warning, danger, info |

### `03 — Data Display` (7 assets)

| Component | Variants | Notes |
|---|---:|---|
| Avatar | 3 | Small, medium, large |
| Card | 3 | Default, interactive, selected |
| Metric Card | 3 | Up, down, neutral trend |
| Progress | 4 | Normal, success, warning, danger |
| Table Row | 4 | Default, hover, selected, disabled |
| Alert | 4 | Info, success, warning, danger |
| Data Table | 3 | Default, empty, loading; includes toolbar, columns and footer |

### `04 — Navigation` (5 assets)

| Component | Variants | Notes |
|---|---:|---|
| Navigation Item | 4 | Default, hover, active, disabled |
| Tab | 3 | Default, active, disabled |
| Menu Item | 4 | Default, hover, disabled, destructive |
| Breadcrumb Item | 3 | Link, current, long/truncated |
| Stepper Item | 3 | Complete, current, upcoming |

### `05 — Feedback & Overlays` (7 assets)

| Component | Variants | Notes |
|---|---:|---|
| Toast | 4 | Info, success, warning, danger |
| Dialog / Confirmation | 2 | Standard, destructive |
| Dropdown Option | 4 | Default, hover, selected, disabled |
| Skeleton | 3 | Text, avatar, chart |
| Tooltip | 1 | Base component |
| Drawer / Sheet | 2 | Standard invite form, destructive confirmation |
| Command Palette | 1 | Global search/action list shell |

### `06 — SaaS Patterns` (12 assets)

| Component | Variants | Notes |
|---|---:|---|
| Filter Chip | 3 | Default, applied, disabled |
| Team Member Row | 3 | Active, pending, suspended |
| Integration Card | 3 | Available, connected, error |
| Plan Card | 3 | Starter, Pro, Business |
| File Upload Dropzone | 5 | Idle, dragging, uploading, complete, error |
| Pagination | 3 | First, middle, last page |
| Notification Item | 2 | Read, unread |
| Empty State | 1 | Base component with a clear call to action |
| Calendar Day | 5 | Default, today, selected, range, unavailable |
| Calendar / Month Panel | 1 | Full month calendar panel |
| Accordion Item | 3 | Collapsed, expanded, disabled |
| Command Item | 4 | Default, active, disabled, destructive |

### `07 — Ziki Issues Components` (7 assets)

| Component | Variants | Notes |
|---|---:|---|
| Issue Stage Tab | 6 | Inbox, Open, In progress, Review, Approved, Attention |
| Issue Vote | 2 | Default, voted |
| Issue Type Icon | 4 | Bug, security, feature, accessibility |
| Issue Priority | 4 | Low, medium, high, urgent |
| Issue Stage Progress | 5 | Five-step issue workflow status strip |
| Issue Toolbar Action | 3 | Search, filter, sort |
| Issue Row | 1 | Editable title, metadata, votes and reporter initials; aligned type/priority/stage cells |

Some icon/priority/stage patterns are intentionally compact. In application code, keep the corresponding text status available to assistive technologies and provide tooltips where a glyph alone is not sufficiently clear.

---

## 5. Screen composition and component rules

### App shell
- Use the plum rail as a stable application switcher/primary navigation region.
- Keep workspace identity and user controls in a near-white top bar.
- Use the pale neutral canvas behind the primary content panel.
- Treat the content panel as the primary reading surface, with a large white field and rounded corners.

### Issue stage tabs
- The entire stage selector sits on a quiet neutral capsule.
- Only the selected stage uses a blue filled capsule with white label and count.
- Keep status icon color distinct: blue for in-progress, orange for review, green for approved, red for attention.
- Stage counts must be bound to live data in production.

### Issue rows
- Keep the vote control left-aligned with a thin urgency-colored outline.
- Issue title is the highest-emphasis element in the row.
- ID, comment/attachment counts, platform and relative time use tertiary metadata styling.
- Type, priority, progress and reporter cells form a consistent right-aligned column group.
- Separate rows using the `#E8E8EA` divider. The reference uses flat white rows rather than elevated cards.

### Toolbar
- Search, filter and sort are round 40 px outline controls.
- “New issue” is a separate text-plus-icon action, not another round icon button.
- Buttons need hover, pressed, disabled and visible keyboard-focus states in the implementation.

### Priority and stage signals
- The reference uses bar/segment indicators, not large status badges, for priority and workflow position.
- Use red/orange on the segments that indicate an elevated state and pale neutral for inactive segments.
- Always provide accessible textual status for type, priority and stage; color or glyph alone is insufficient.

---

## 6. Interaction and accessibility requirements for implementation

Figma provides the editable visual components. Interaction behavior must be implemented and tested in the consuming application.

- **Search:** support keyboard focus, clear text, no-results, loading and error states.
- **Filters:** indicate applied filters, let users remove them, and expose the active filter values.
- **Sorting:** indicate the current sort field and direction; support toggling direction.
- **Voting:** make selected/upvoted state explicit; update vote totals optimistically only if the product can reconcile errors.
- **Stage tabs:** use an accessible selected state and keep each count connected to its stage query.
- **Issue rows:** support row navigation and keep independent buttons (vote, menu or open issue) keyboard reachable.
- **Priority and stage indicators:** provide accessible names such as “High priority” and “In review”.
- **Reporter avatar:** provide a text alternative with the reporter’s name where known; use initials only as the visual fallback.
- **Focus:** show a visible focus ring on buttons, links, fields and menu items.
- **Contrast:** validate text/status combinations after any theme change. Do not assume a light/dark alias is accessible simply because it is semantically named.
- **Reduced motion:** keep any progress, loading and state-transition animations subtle and respect the user’s reduced-motion setting.
- **Responsive layout:** at tablet sizes, preserve title, primary action and stage selection; allow the issue table to scroll horizontally or transition into stacked issue cards. At mobile sizes, collapse low-priority metadata before hiding status meaning.

---

## 7. Responsive behaviour

The current composition is the desktop reference. For smaller viewports:

1. Keep the rail icon-only or collapse it into a drawer.
2. Allow the topbar to reduce global search width while keeping workspace/profile identity available.
3. Let stage tabs horizontally scroll rather than wrap into a large multi-row block.
4. Keep vote + title/meta as the primary row region; type/priority/stage can move into a secondary detail line or issue detail view when the viewport becomes narrow.
5. Do not shrink text below comfortable readability to preserve a desktop-style table.
6. Keep New Issue reachable as the primary action.

---

## 8. Implementation notes and next steps

- Primitive and semantic colors are stored as Figma variables; prefer variable-bound colors for fills and strokes.
- Spacing, radius and sizing tokens are stored in separate variable collections.
- Inter is the component-library font family.
- The component library and companion screen are separate Figma files. Publish/enable the master library through Figma’s Assets/Library workflow to use linked cross-file instances. Otherwise, treat the companion file’s components as local copies that need explicit reconciliation when the master changes.
- Replace typographic icon approximations with the project’s canonical SVG/Lucide assets before production.
- Replace sample issues, counts, names, avatar initials and dates with real data.
- Add the project’s actual pressed/loading/error behavior and test the focus, hover, and disabled states in the consuming application.

## 9. Screenshot-matching QA checklist

- [x] Warm plum rail and selected rail tile
- [x] Near-white application header and white content panel
- [x] Light-grey workspace background and thin row dividers
- [x] Blue selected Inbox capsule and colored status icons
- [x] Circular search/filter/sort controls and standalone New Issue action
- [x] Three editable issue rows with vote counts, metadata, type, priority bars, stage tracks and avatars
- [x] Editable Figma master components for stage tabs, issue voting, issue type, priority, stage progress, toolbar actions and issue rows
- [x] Color primitive and semantic tokens updated to the screenshot-matched palette
- [ ] Replace approximate glyph icons with official product SVG assets
- [ ] Publish and enable native shared-component library link between the two Figma files
- [ ] Validate all keyboard, focus, responsive and production-data states in the implemented app
