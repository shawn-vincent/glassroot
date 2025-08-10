# OpenRouter Model Selection UX Specification

*Generated: 2025-08-10*  
*Author: ChatGPT-5 via Codex*  
*Context: Mobile-first fullscreen model selector for Glassroot React app*

## Overview

**Purpose**: Mobile-first, fullscreen model selector for browsing, searching, and choosing OpenRouter AI models with clear current-selection, free/paid handling, and minimal modern UI.

**Audience**: Users configuring a chat/agent; both novices and power users selecting among hundreds of models.

**Design System**: React with Tailwind v4, shadcn components, Lucide icons; minimal, low-chrome aesthetic.

## Goals

- Fast to find/select the right model with minimal friction
- Scales to hundreds of models with performant scrolling and filtering
- Clear pricing and capability cues; free vs paid distinction
- Keyboard interactions feel stable; no layout jumps or obscured controls
- Accessible and readable in a one-handed mobile context

## Non-Goals

- Deep multi-model comparison matrices
- Complex plan management or billing flows (only surface paywall/credits status)
- Model fine-tuning/configuration beyond selection

## User Flows

### Open Selector
- **Trigger**: Tap current model name in config panel
- **Result**: Fullscreen overlay slides up; focus moves to search; content scrolls to top

### Browse & Sort
- **Default tab**: Recommended (ranked by quality/latency/cost heuristics)
- **Other tabs**: All, Favorites, Recent
- **Navigation**: Scroll through virtualized list; sticky group headers (e.g., "Top Picks", "Popular", "New")

### Search
- **Interaction**: Type model name/provider/capability/price queries; suggestions and recent searches appear as chips; results filter live
- **Keyboard handling**: Keyboard open; filter chips remain visible; "Cancel" clears input/focus

### Filter
- **Quick filters**: Quick chips (capabilities, price tier, context length) directly under search
- **Advanced**: "More Filters" opens compact sheet for advanced criteria (multi-select)
- **Sort options**: "Smart", "Price", "Speed", "Context length", "Popularity"

### Inspect Model
- **Peek view**: Tap row for inline expand (peek) or info icon for detail sheet
- **Details**: Full pricing, context length, capabilities, provider, latency notes, usage examples, and availability (free/paid)

### Select & Confirm
- **Selection**: Single-select model; row shows "Selected" with checkmark; footer CTA "Use Model" enabled
- **Commit**: Tap CTA applies selection, closes overlay; prior selection persists if user cancels

### Free vs Paid Handling
- **Display**: Paid models show badge and per-1k token pricing
- **Paywall**: If insufficient credits, CTA changes to "Enable Billing" leading to billing screen (non-blocking browse)

### Empty & Error States
- **No results**: Explain criteria, show "Clear filters" and suggest broader options
- **Offline/Network**: Show cached models if available; banner "Offline"; retry action

## Layout & Hierarchy

### Container
Fullscreen overlay with dimmed backdrop; slide-from-bottom animation; status/safe areas respected.

### Header
- Top app bar with title "Choose Model", close button (X), and optional drag handle affordance
- Search as primary input directly below title; "Cancel" action appears when focused

### Filters Row
- Horizontally scrollable chips: Free, Paid, Capabilities (Text, Vision, Audio, Tools, Reasoning), Context (≥ 8k, ≥ 32k, ≥ 128k, ≥ 200k), Provider (OpenAI, Anthropic, Google, Mistral, etc.)
- "More" chip opens advanced filters sheet

### Content
- Tabs/segments: Recommended, All, Favorites, Recent (small segmented control)
- Virtualized list of model rows grouped by category with sticky headers

### Footer
- Context bar with current selection summary and primary CTA "Use Model"
- On keyboard open, footer floats above keyboard with safe-area padding

## Model Row Design

### Collapsed State
- **Left**: Model name (prominent), provider (secondary), "Current" badge if in use
- **Middle**: Capability icons (Lucide): brain (reasoning), image (vision), mic (audio), wrench (tools), sparkles (creative), bot (chat)
- **Right**: Price badge (Free or $ cost range), context length (e.g., "128k"), chevron/info icon
- **Subtext**: Short descriptor or latency/policy indicator if available
- **States**: Default, Hover/Active (tap feedback), Selected (checkmark), Disabled (unavailable; with reason tooltip/label)

### Model Details (Peek/Sheet)
- Title + Provider + Verified check if applicable
- **Pricing**: Input/Output per 1k tokens; show min/max; note free tier if exists
- **Context**: Max context length and streaming/tool support
- **Capabilities**: Icons with labels; quick definitions on tap
- **Performance**: Latency class (Fast/Normal), popularity
- **Actions**: "Use Model" and "Favorite"; link to documentation if relevant

## Search & Filtering System

### Search Input
- **Placeholder**: "Search models, providers, or try 'vision 200k'"
- **Token parsing**: Supports price terms (free, cheap, <$0.5/1k), capabilities (vision/audio/tools), provider names, context numbers with k suffix
- **Behavior**: Debounced query; highlights matching text in results

### Suggestions
- Recent searches chips (last 5)
- Dynamic suggestions by popularity and user history

### Filter Categories
- **Quick Chips**: Toggle multi-select; show count badge when active
- **Advanced Filters**:
  - **Price**: Free only, Paid only, Max input/output cost sliders or presets
  - **Provider**: Multi-select list with search
  - **Context length**: Min threshold slider/presets
  - **Capabilities**: Checkboxes
  - **Availability**: Public, Requires billing, Region-locked (if applicable)

### Sort Options
- **Smart** (quality/latency/cost blend; default)
- **Price**: Low to high
- **Speed**: Fastest first
- **Context**: Longest first
- **Popularity**: Most used

### Filter Feedback
- Pill summary above list (e.g., "Free • Vision • ≥128k • Mistral • Price: Low→High")
- "Clear all" appears when any filter active

## Keyboard Handling Strategy

### Focus Management
- On open, move focus to search; announce "Model search" for screen readers
- Hitting "Cancel" blurs input, hides keyboard, restores header height

### Layout Stability
- Keep header and filter chips visible when keyboard opens
- Footer CTA repositions above keyboard; always visible; no overlap

### Viewport Strategy
- Use visual viewport measurements to adjust bottom padding for list and footer
- Prevent content jump by reserving space for footer; animate transitions smoothly

### Dismissal Patterns
- Down-swipe gesture or "Done/Return" on keyboard commits search without closing
- "Enter" doesn't auto-select to avoid accidental changes
- Tap outside disabled (fullscreen); use close button or swipe to dismiss

### Accessory Actions
- Show inline "Clear" icon within search when text present
- Provide quick chip suggestions visible above keyboard

## Visual Hierarchy & Information Architecture

### Information Priority (per row)
Name > Provider > Capability icons > Price/Context badges > Secondary meta

### Visual Emphasis
- Current selection highlighted with subtle tinted background and "Current" badge
- Recommended models get small "Top pick" badge; restrained use to avoid noise

### Badge System
- **Free** (neutral/positive accent)
- **Paid** (neutral) 
- **Context length** (subtle)

### Typography
- Clear type scale (mobile-optimized)
- Names truncate gracefully with ellipsis

### Color & Iconography
- Minimal palette, high contrast
- Icons as reinforcement not decoration
- Include labels in details to avoid icon-only meaning

### State Indicators
- Loading skeletons for rows
- Empty states with guidance
- Error banners inline

## Accessibility Requirements

### Semantic Structure
- Fullscreen overlay as modal dialog with proper labeling
- Focus trapped within modal
- List as listbox with options that are single-select
- ARIA-selected reflects current state

### Touch Targets
- Minimum 44x44dp for all tappable elements
- Row tap selects; info icon and favorite have separate targets

### Labels & Announcements
- Each icon has accessible label (e.g., "Vision capability")
- Price announced as "Free" or "$0.25 per 1k input tokens"

### Focus Management
- **Focus order**: Close > Title > Search > Filter chips > Tabs > List items > Footer CTA
- Hardware keyboards can tab through focusable elements
- Enter doesn't commit selection; Escape closes

### Motion & Contrast
- Respect reduced motion preference; switch to fades; no parallax
- WCAG AA compliance for text and UI components
- Avoid color-only status indicators

## Performance Optimization

### List Rendering
- Windowed rendering of rows with sticky headers
- Overscan minimal to maintain 60fps scroll
- Memoized row components keyed by model ID

### Data Management
- Fetch list on app start or overlay open; show skeletons
- Cache results with stale-while-revalidate pattern
- Build lightweight in-memory search index

### Search Performance
- Pre-tokenize searchable fields
- Fuzzy matching with acronym/alias support
- Move search/filtering to Web Worker for large datasets
- Debounce input appropriately

### Asset Optimization
- Lazy load provider logos; fallback to initials
- Static icon sprite for capabilities
- Avoid heavy gradients/shadows in favor of performance

### State Persistence
- Cache favorites, recents, last-used filters locally
- Hydrate quickly before network refresh

## Responsive Behavior

### Small Phones (<360dp width)
- Single-column, compact paddings
- Chips show first few with overflow indicator
- Details as full sheet

### Standard Phones
- Default layout
- 6–8 chips visible in filter row
- Tabs as segmented control

### Large Phones/Phablets
- Additional metadata in row (latency or popularity chip)

### Landscape Orientation
- Header compresses vertically
- Filters collapse into horizontal scroll
- Footer remains anchored
- Consider two-column peek in details if space permits

### Tablets & Desktop
- Centered modal with max-width constraint
- Still single-column list (no grid needed)
- Wider paddings and spacing

## Content & Microcopy

### Key Messages
- **Search placeholder**: "Search models, providers, or try 'vision 200k'"
- **Empty state**: "No models match these filters." Actions: "Clear filters", "Try broader terms"
- **Error state**: "Couldn't load models. Check connection and retry."
- **Paid models**: "Paid • From $X per 1k tokens"
- **Billing required**: "Requires billing"
- **Current selection**: "Current model" badge
- **New selection**: "Selected" with checkmark

## Advanced Filtering Details

### Price Filtering
- **Tiers**: Free, <$0.10, $0.10–$0.50, >$0.50 (per 1k input or output with toggle)
- Show both input and output costs
- Primary sort uses selected cost basis

### Context Length
- Presets and slider for minimum threshold
- Display in k tokens format
- Use "≥" semantics for clarity

### Capabilities
- Text, Vision, Audio, Tools, Function calling, Reasoning/Long-think, JSON output
- Icon + label pairs for clarity

### Provider Options
- Group by major providers
- "More" shows complete searchable list

### Availability States
- Public, Requires billing, Region limited
- Disabled options include explanatory text

### Sort Algorithms
- **Smart**: Weighted score combining quality/popularity/latency/price
- Show current sort as pill indicator

## Free vs Paid Model Handling

### Visual Indicators
- Free badge prominently displayed
- Paid shows cost estimate
- "Free tier available" for models with both options

### Billing Flow Integration
- If billing required and not enabled: selecting shows inline toast and CTA "Enable Billing"
- User can continue browsing; selection not applied until billing enabled
- Non-blocking exploration of paid options

### Cost Transparency
- Short explanation tooltips: "$X per 1k input tokens, $Y per 1k output"
- Clear pricing tiers and thresholds

## Current Selection Management

### Visual Treatment
- "Current" badge on in-use model
- Pinned mini-section "In Use" at top of Recommended tab

### Selection Feedback
- Selecting replaces row's right side with checkmark and "Selected"
- Footer CTA text changes to "Use Model (ModelName)"

### Confirmation Pattern
- Close without CTA retains previous model
- Explicit confirmation required to apply changes
- Prevents accidental model switches

## Gesture & Interaction Patterns

### Dismissal Gestures
- Swipe down or tap X to close
- Maintain scroll position on re-open within session

### Quick Actions
- Heart icon on row toggles favorite without opening details
- Persists to Favorites tab immediately

### Optional Enhancements
- **Long press**: Opens quick actions (Favorite, Compare, Share link)
- **Compare mode**: Adds up to 2 items to temporary comparison bar

## Error Handling & Edge Cases

### Missing Data
- Show "—" with tooltip "Not provided"
- Don't block selection for missing metadata

### Service Issues
- "Temporarily unavailable" badge for rate-limited models
- Suggest similar available alternatives

### Network Problems
- Load from last known cache
- Banner: "Offline • Results may be outdated"
- Provide retry mechanism

### Large Result Sets
- Show "Showing top 200 results. Narrow your filters."
- Encourage more specific search terms

## Iconography Reference (Lucide)

### Capability Icons
- **brain**: Reasoning/Analysis
- **image**: Vision/Image processing  
- **mic**: Audio processing
- **wrench**: Tools/Function calling
- **brackets-curly**: JSON output
- **message-circle**: Chat/Conversation

### Status & Meta Icons
- **check-circle**: Selected state
- **star**: Top pick/Recommended
- **heart**: Favorite toggle
- **badge-dollar**: Paid model
- **gift**: Free model
- **gauge**: Speed/Performance
- **layers**: Context length

### Action Icons
- **search**: Search input
- **filter**: Filter controls
- **x**: Close/Cancel
- **info**: Model details
- **chevron-right**: Expand/More

## Quality Acceptance Criteria

### Performance Benchmarks
- Time-to-first-list < 500ms from overlay open (with cache)
- Scroll performance: 60fps on mid-range devices
- Search results update within 100–200ms after typing pause

### Accessibility Compliance
- WCAG 2.1 AA compliant
- Screen-reader navigable with proper roles/labels
- Visible focus indicators throughout

### Usability Standards
- Model found and selected within 2–3 interactions in common cases
- No layout jumps on keyboard appearance
- Footer and filter chips remain accessible during keyboard input

## Implementation Priorities

### Phase 1 (MVP)
- Basic fullscreen overlay with search
- Model list with essential metadata
- Single-select with confirmation
- Free/paid distinction

### Phase 2 (Enhanced)
- Advanced filtering system
- Favorites and recents
- Performance optimizations
- Comprehensive accessibility

### Phase 3 (Power User)
- Comparison features
- Detailed analytics
- Advanced sorting algorithms
- Personalization

## Open Questions for Implementation

1. **Selection pattern**: Auto-apply on tap vs explicit confirm? (Recommend explicit confirm for safety)
2. **Regional features**: Show latency estimates per region? (Requires user location)
3. **Community features**: Include ratings/reviews? (Consider deferring to reduce complexity)
4. **Comparison tool**: Include in v1? (Recommend deferring)

## Summary

This specification outlines a comprehensive mobile-first model selection experience that prioritizes:

- **Performance**: Fast loading, smooth scrolling, responsive search
- **Accessibility**: WCAG compliant, keyboard/screen-reader friendly
- **Clarity**: Clear pricing, capability indicators, current selection
- **Flexibility**: Powerful search and filtering without overwhelming simplicity
- **Stability**: Reliable keyboard handling, consistent layouts
- **User Safety**: Explicit confirmation, clear billing requirements

The design balances power-user needs (advanced filtering, detailed model info) with casual user simplicity (smart defaults, clear visual hierarchy) while maintaining the minimal aesthetic and mobile-first approach that defines the Glassroot experience.