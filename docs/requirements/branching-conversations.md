Alright — here’s the **full, clean Proposal A spec** with the *Reply Stack Badge* mental model, “Author” terminology, and no leftover branch jargon.
It’s written so you can drop it straight into a dev handoff doc.

---

# **Specification — Proposal A: Reply Stack Badge**

## 1. Purpose & Goals

The **Reply Stack Badge** UI lets a user:

* **Add a new reply** at any point in the conversation (either their own or an AI-generated/regenerated one).
* **Switch between multiple replies** to the same preceding message.
* Keep the main conversation **readable and linear**, while quietly supporting multiple alternate continuations.

Goals:

* **Conversational mental model**: “There are other replies here,” not “this is a branch.”
* Works for:

  * User replies.
  * AI regenerations (same or different settings/models).
  * Root-level alternate conversations.
* Store each continuation as its **own markdown file** linked to the originating message.

---

## 2. Core Concepts

### 2.1 Message Node

* Any user or assistant message in the conversation.
* The **root node** is a virtual message representing the very start of the conversation (no text).

### 2.2 Reply Set

* All replies that follow the same preceding message.
* Exactly one reply from the set is **active** in the visible transcript.
* Replies may be from:

  * **User** (you or other humans)
  * **AI models** (assistant-generated content)

### 2.3 Active Reply

* The reply currently displayed in the transcript.
* Switching active reply **changes the visible conversation from that point onward**.

---

## 3. Visual Elements

### 3.1 Reply Stack Badge

* **Icon**: Two overlapping speech bubbles `💬` (or a stack-of-messages icon).
* **Count**: Total replies in this set.

  * Icon only if count = 1 (meaning only the active reply exists).
  * `💬 3` if there are three total replies.
* **Placement**: Right-aligned in the message header or in a narrow gutter to the right.
* **Tooltip on hover**:

  * If >1: `"3 replies — click to view others"`
  * If exactly 1: `"Add another reply"`

---

## 4. Interactions

### 4.1 Viewing Other Replies

* **Click the Reply Stack Badge** → opens **reply switcher popover**.
* Popover lists for each reply:

  * **Title**: Auto-generated from the first \~8 words of the reply text.
  * **Author**:

    * `"You"` for user-authored replies.
    * Display name or model label for AI replies (e.g., `"gpt-5"`, `"Claude 3.5"`).
  * **Timestamp** of the reply.
* Active reply is marked with a check.
* Keyboard ↑/↓ to move through the list, Enter to select.

### 4.2 Adding a New Reply

* In the popover, show:

  * `"Write a new reply"` — opens composer anchored to this message.
  * `"Ask AI to reply again…”` — opens regeneration menu:

    * Same model/settings.
    * Different model/settings (model picker).
* A new reply is stored as a new conversation file from root → `reply_to_msg_id` → new reply.

### 4.3 Switching Replies

* Selecting a different reply:

  * Replaces visible conversation from that message onward.
  * Fade out old path beyond that point, fade in new path.
* Keyboard shortcuts:

  * `[` = previous reply in set.
  * `]` = next reply in set.
* Ctrl/Cmd+Click on badge = open this reply in a new tab/context.

### 4.4 Mobile

* Long-press badge → reply switcher slides up from bottom.
* Swipe left/right to change active reply in current set.

---

## 5. Data Model

### 5.1 Markdown File Structure

```markdown
---
id: c_8f2a
parent_id: c_1a9d
reply_to_msg_id: m_14
base_sha: 3b71c9e
title: "Image prompt variant B"
created: 2025-08-10T13:02:01Z
author: gpt-5
---

## m_01 (role: user, author: you, ts: 2025-08-10T12:00Z)
Hello, bot.

## m_02 (role: assistant, author: gpt-5, tokens: 16)
Hi! How can I help?
```

**Field meanings**

* **id** — unique conversation file ID.
* **parent\_id** — conversation ID from which this reply originates (null for root).
* **reply\_to\_msg\_id** — message ID in parent conversation this reply follows.
* **base\_sha** — hash of content from root to `reply_to_msg_id`.
* **title** — auto-generated from first reply line; editable.
* **created** — ISO timestamp.
* **author** — human-readable source name (`"You"`, `"Alice"`, `"gpt-5"`, etc.).

---

## 6. Rendering Logic

1. **Load active conversation file**.
2. **Trace lineage** from `parent_id` to root.
3. For each message in lineage:

   * Find all files with same `{parent_id, reply_to_msg_id}`.
   * If count > 1, render Reply Stack Badge with count.
4. Badge click → populate reply switcher from matching files.

---

## 7. Edge Cases

* **Deleted reply** — if active reply is deleted, fallback to earliest remaining reply in set.
* **Root-level alternates** — badge at conversation top acts as conversation selector.
* **Large reply sets** — if count > 9, show `💬 9+`.
* **Missing reply\_to\_msg\_id** — treat as root-level alternate.

---

## 8. Accessibility

* Badge = `<button>` with ARIA label:
  `"3 replies available after this message"`.
* Popover = `role=listbox`; each reply = `role=option`.
* Keyboard navigation:

  * Tab to focus badge, Enter to open popover, arrows to navigate, Enter to select.

---

## 9. Implementation Phases

1. **Phase 1** — Static UI: badges, popover, mock data.
2. **Phase 2** — Metadata scanning to display badge counts.
3. **Phase 3** — Reply switching (file swap after `reply_to_msg_id`).
4. **Phase 4** — Reply creation flows (user & AI).
5. **Phase 5** — Keyboard shortcuts & mobile gestures.
6. **Phase 6** — Root-level handling.

---

## Appendix — Future Upgrade: Commit-Rail Scrubber

*Optional future enhancement for power users*:

* Horizontally scrollable “message timeline” above transcript.
* Stacked dots at positions with multiple replies.
* Drag to scrub; up/down to switch replies at that point.
* Works alongside Reply Stack Badge for high-speed navigation.

---

If you want, I can immediately follow this with a **React + Tailwind component skeleton** for:

* Reply Stack Badge (counted from markdown files)
* Reply switcher popover (with Author/Title/Timestamp)
* Reply switching logic

That way your dev team can go straight from this spec to a working prototype.
Do you want me to prepare that?
