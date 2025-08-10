# OpenRouter Model Selection — Simplified UX Spec

Generated: 2025-08-10  
Author: Codex CLI assistant  
Context: Mobile-first, minimal model picker for Glassroot

## 1) Scope & Non-Goals

This spec intentionally reduces the model selector to a single, focused flow and minimal UI. It removes complex filtering, comparison, favorites/recents, multi-step flows, and most edge cases.

In-scope:
- Show current model card (name, provider, key info).
- Tap opens fullscreen selector with search, basic sort, and simple filters.
- Pick a model, close selector, update the card.

Out-of-scope (explicitly removed):
- Advanced filter systems, favorites/recents/tabs, comparison features, detailed pricing breakdowns, multi-step confirmations, paywall or billing flows, recency/frequency heuristics, model detail sheets, group headers, badges beyond essentials, and extensive edge cases.

## 2) Constraints & Stack

- Mobile-first design (iOS/Android): large touch targets, safe-area, stable keyboard behavior.
- Tailwind CSS v4 + shadcn UI components + Lucide icons.
- Minimal aesthetic; low visual chrome; clear hierarchy.
- Performance for hundreds of models: virtualized list, lightweight rows, debounced search.

## 3) User Flow (Simple 3 Steps)

0. Current selection visible as a compact card.
1. User taps the card → opens a fullscreen modal with search + list.
2. User searches/browses and taps a model to select it.
3. Modal closes; the card reflects the new selection.

No extra confirmations. Cancel closes without changes.

## 4) Essential UI Components

### 4.1 Current Model Card (`<ModelCard />`)
- Content: model name (primary), provider (secondary), 1–2 key facts (e.g., context length, simple price label like "Free" or "$").
- Interaction: entire card is a button; opens selector.
- Layout: single-line name (truncate), subline provider; small badges for key facts.
- Icons: optional Lucide provider icon fallback (e.g., `BadgeInfo`), or generic model icon.
- Size: touch target ≥ 44×44dp; spacing for thumb reach.

### 4.2 Fullscreen Selector Modal (`<ModelSelectorModal />`)
- Container: shadcn `Dialog` in fullscreen mode; scrim backdrop; content slides from bottom.
- Header: title "Choose Model"; trailing `X` close button.
- Search: single search input pinned under header; clear ("×") affordance.
- List: virtualized scroll of `ModelListItem` rows; simple inline divider; no tabs.
- Footer: none (selection is immediate by tapping a row).

### 4.3 Search Input (`<Input />` from shadcn)
- Placeholder: "Search models or providers…".
- Behavior: debounced input (150–250ms) with case-insensitive substring match on name/provider.
- Keyboard: auto-focus on open; "Cancel" soft action via header close; return key does not auto-select.

### 4.4 Model List Item (`<ModelListItem />`)
- Left: model name (bold), provider (subtext).
- Right: minimal badges (e.g., context: "128k", price: "Free"/"$").
- States: default, pressed, selected (check icon appears on the chosen row while modal is open).
- Touch target: entire row (≥ 44×44dp).

## 5) Interactions & States

### 5.1 Open/Close
- Tap `ModelCard` → open modal, focus into search input.
- Close via header `X`, system back, or swipe-down gesture (if enabled by platform). Closing without selection leaves the current selection unchanged.

### 5.2 Searching
- Debounced filtering on name and provider only. No advanced tokens, no capability filters.
- Sort: simple client-side sort toggle in the search row overflow: "A→Z" (by name) | "Provider". Default: A→Z.
- Keyboard open keeps header + search fixed; list scrolls beneath.

### 5.3 Selecting
- Tap a row → mark as selected → immediately close modal → propagate selection to parent → update `ModelCard`.
- No secondary confirm. Selection change is final on tap.

### 5.4 Loading/Empty/Error
- Loading: skeleton rows (3–6) in place of list items.
- Empty search result: centered message "No models match your search." with "Clear search" button.
- Error: inline banner at top of list area "Couldn't load models. Retry." with a retry button.

## 6) Mobile Keyboard Behavior

- On open: auto-focus search; scroll position at top.
- When keyboard opens: use visual viewport to pad bottom of list; avoid content jumps; no overlap.
- Return key: dismisses keyboard (blurs input), does not select a model.
- "X" close remains visible and reachable; do not hide header.
- Dismiss keyboard on list scroll start (optional; platform-testing recommended) to reduce occlusion.
- Preserve search text on keyboard dismiss; do not clear unless user taps clear.

## 7) Accessibility (Basic)

- Modal: `role="dialog"` with `aria-modal="true"`; labeled by header title "Choose Model". Focus trap within modal.
- Search input: labeled; announce placeholder; `aria-live="polite"` summary of result count after debounce (e.g., "24 results").
- List: `role="listbox"`; rows are `role="option"` with `aria-selected` for the current choice.
- Selection: announce "Selected {model name}" on tap before closing.
- Buttons and rows: minimum 44×44dp, visible focus ring, sufficient contrast.
- System back/escape: closes modal and restores focus to the `ModelCard` trigger.

## 8) Performance Principles

- Virtualization: windowed list (e.g., `react-virtual`) with dynamic row heights avoided; use consistent item height.
- Lightweight rows: avoid images and heavy icons; use Lucide line icons; lazy load icon set.
- Debounced search: 150–250ms; lower for high-end devices can be considered later.
- Memoization: memoize list items; stable keys; avoid re-renders beyond the filtered set.
- Data size: handle hundreds of models in-memory; parse once and reuse; avoid sorting on every keystroke (pre-sort name/provider arrays; switch between them).

## 9) Data Model (Minimum)

```ts
type Model = {
  id: string;            // unique
  name: string;          // e.g., "gpt-4o-mini"
  provider: string;      // e.g., "OpenAI"
  contextK?: number;     // e.g., 128
  priceLabel?: string;   // "Free" | "$" | "$1.0/1k" (short)
};
```

Derived display fields:
- `contextBadge`: show `${contextK}k` if provided.
- `priceBadge`: show `priceLabel` if provided; keep short.

## 10) Events & Props (Essentials)

`<ModelCard model={Model} onOpenSelector={() => void} />`
- Renders current selection; triggers selector open.

`<ModelSelectorModal
  open: boolean,
  models: Model[],        // full dataset (pre-fetched)
  selectedId?: string,    // currently selected
  onClose: () => void,
  onSelect: (id: string) => void,
/>`
- Internal state: `search`, `sortMode` ('name' | 'provider'), `loading`, `error`.
- Behavior: filter by `search`; sort by `sortMode`; tap row → `onSelect(id)` → `onClose()`.

## 11) Visual Design Notes (Tailwind/shadcn)

- Card: shadcn `Card` or `Button` with low emphasis; Tailwind spacing `p-3 md:p-2`, rounded `rounded-lg`, border `border-border/50`.
- Text: name `text-sm font-medium`, provider `text-xs text-muted-foreground`.
- Badges: shadcn `Badge` tiny, `text-[10px] px-1.5 py-0.5`, variants: default (context), secondary (price).
- Modal: shadcn `Dialog` styled fullscreen; header `sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b`.
- Search: shadcn `Input` `h-10 text-sm` with left search icon (Lucide `Search`), right clear button.
- List item: `h-12 flex items-center justify-between px-3` with pressed state `active:bg-accent` and divider `border-b`.
- Icons: Lucide `Search`, `X`, `Check`; keep icon size ≤ 18px for density.

## 12) Empty, Loading, Error (Minimal)

- Loading: 3–6 skeleton rows using shadcn `Skeleton` or Tailwind `animate-pulse` placeholders.
- Empty: icon (Lucide `SearchX`) + "No models match your search." + `Button` "Clear search".
- Error: inline `Alert` with retry; no modal takeover.

## 13) Pseudocode Flow

```tsx
// Card
<button onClick={() => setOpen(true)} aria-label="Current model: ${name}">
  <div>{name}</div>
  <div>{provider}</div>
  <div>{contextBadge} {priceBadge}</div>
</button>

// Modal (open)
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="fixed inset-0 p-0"> 
    <header>Choose Model  [X]</header>
    <SearchInput value={search} onChange={setSearch} />
    {loading ? <SkeletonList/> : error ? <InlineError/> :
      <VirtualList items={filteredSortedModels} renderRow={ModelListItem}/>
    }
  </DialogContent>
 </Dialog>

function onRowTap(id) {
  onSelect(id); // lift to parent
  setOpen(false);
}
```

## 14) Testing Checklist (Essentials Only)

- Open/close: tap card, header X, system back.
- Keyboard: auto-focus, no overlap, return dismisses keyboard without selection.
- Search: debounce works; filtering accurate for name/provider; sort toggle switches order.
- Selection: tap row selects and closes; card updates.
- Performance: smooth scroll on 500–1000 models; no jank on typing; limited re-renders.
- Accessibility: focus trap, roles/labels, `aria-selected`, focus return to trigger on close.

## 15) Future Hooks (Not in this version)

- Capability filters, favorites/recents, detailed pricing, model details sheet, tabs, categories, server-backed search. Keep data model and components ready to extend later, but do not expose these features now.