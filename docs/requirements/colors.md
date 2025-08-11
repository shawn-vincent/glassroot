Here’s the **full, revised, comprehensive visual spec** for a **multi-participant AI chat UI** in a **shadcn/ui + Tailwind** project — now including **error messages** as a first-class role alongside participants, system, and tool messages.

---

# **Visual Specification — Multi-Participant Chat (Light/Dark, Accents, Errors)**

---

## **0) Overview & Goals**

* **Support**: multi-participant chat with user, assistants, tools, system messages, and inline error messages.
* **Theming**: Light and Dark modes.
* **Identity**: Per-participant accent colors.
* **Readability**: WCAG AA minimum contrast.
* **Markdown**: Inline and block code with nested block handling.
* **Actions**: Inline error actions (retry, copy, details) without modal interruptions.
* **shadcn/ui Integration**: Uses Tailwind’s `dark` mode + CSS variables.

---

## **1) Theming & Token Architecture**

### **1.1 Theme Switching**

* Controlled via `data-theme="light"` / `data-theme="dark"` on `<html>`.
* Tailwind configured with `darkMode: ["class"]` (paired with `.dark` class toggle).

### **1.2 Global Tokens**

| Token           | Light     | Dark      | Usage                                |
| --------------- | --------- | --------- | ------------------------------------ |
| `--bg`          | `#FFFFFF` | `#0E0E0E` | App background                       |
| `--bg-alt`      | `#F7F7F7` | `#1A1A1A` | Alternate surfaces (message neutral) |
| `--text`        | `#1A1A1A` | `#EAEAEA` | Primary text                         |
| `--text-muted`  | `#666666` | `#AAAAAA` | Secondary text                       |
| `--border`      | `#DDDDDD` | `#2A2A2A` | Borders, dividers                    |
| `--code-bg`     | `#F0F0F0` | `#2B2B2B` | Code blocks                          |
| `--code-border` | `#E0E0E0` | `#3A3A3A` | Code block borders                   |

### **1.3 Accent Tokens**

| Accent Class      | Light `--accent` | Dark `--accent` |
| ----------------- | ---------------- | --------------- |
| `.accent-blue`    | `#007AFF`        | `#3B82F6`       |
| `.accent-green`   | `#34C759`        | `#22C55E`       |
| `.accent-purple`  | `#AF52DE`        | `#A855F7`       |
| `.accent-orange`  | `#FF9500`        | `#F97316`       |
| `.accent-pink`    | `#FF2D55`        | `#EC4899`       |
| `.accent-teal`    | `#30B0C7`        | `#14B8A6`       |
| `.accent-neutral` | `#CCCCCC`        | `#666666`       |

> Applied per message or per participant wrapper.

### **1.4 Error Tokens**

| Token              | Light     | Dark      |
| ------------------ | --------- | --------- |
| `--error`          | `#DC2626` | `#F87171` |
| `--error-contrast` | `#FFFFFF` | `#1A1111` |
| `--error-bg`       | `#FEE2E2` | `#3B0F0F` |
| `--error-border`   | `#FCA5A5` | `#7F1D1D` |

---

## **2) Tailwind Config**

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-alt": "var(--bg-alt)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        "code-bg": "var(--code-bg)",
        "code-border": "var(--code-border)",
        accent: "var(--accent)",
        "accent-contrast": "var(--accent-contrast)",
        error: "var(--error)",
        "error-contrast": "var(--error-contrast)",
        "error-bg": "var(--error-bg)",
        "error-border": "var(--error-border)",
      },
      borderRadius: {
        bubble: "12px",
        chip: "999px",
      },
      maxWidth: {
        bubble: "72%",
      },
    },
  },
}
export default config
```

---

## **3) Component Roles**

| Role          | Alignment                 | Background  | Border         | Special                   |
| ------------- | ------------------------- | ----------- | -------------- | ------------------------- |
| **self**      | right                     | accent tint | accent border  | chip w/accent             |
| **assistant** | left                      | `bg-alt`    | accent border  | chip w/accent             |
| **user**      | left                      | `bg-alt`    | accent border  | chip w/accent             |
| **tool**      | left                      | `bg-alt`    | accent border  | chip w/accent             |
| **system**    | center                    | `bg-alt`    | dashed neutral | italic text               |
| **error**     | left (or align to sender) | `error-bg`  | `error-border` | icon, bold title, actions |

---

## **4) Message Component Contract**

```tsx
type Role = "self" | "user" | "assistant" | "tool" | "system" | "error"

interface MessageProps {
  role: Role
  accent?: "blue"|"green"|"purple"|"orange"|"pink"|"teal"|"neutral"
  name?: string
  time?: string
  children: React.ReactNode
  actions?: React.ReactNode
  details?: React.ReactNode
}
```

**Base Classes**:
`max-w-bubble rounded-bubble border px-3 py-2 text-sm leading-relaxed break-words`

**Accent Application**:
`accent-${accent}` sets `--accent`.

**Fills**:

* self → `bg-accent-tint border-accent`
* other → `bg-bg-alt border-accent`
* system → `bg-bg-alt border-border italic border-dashed`
* error → `bg-error-bg border-error`

**Chip**:

* accent → `.chip-accent` (border/accent mix)
* error → `.chip-error` (border/error mix)

---

## **5) Error Message UX**

* Always display an **icon** (`AlertTriangle` or `CircleAlert`).
* Bold **title**: “Something went wrong” or context-specific.
* Optional **details**: collapsible (`Details` button).
* Actions: Retry, Copy, Details.
* Use `role="alert"` and `aria-live="polite"` for accessibility.

**Example**:

```tsx
<Message
  role="error"
  name="Send Error"
  time="10:22"
  details={`POST /api/chat 504\nx-request-id: abc123`}
>
  Couldn’t reach the server. Check your connection and try again.
</Message>
```

---

## **6) Markdown & Code Styling**

```css
.prose-chat :where(code):not(pre code) {
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: 6px;
  padding: 0.1em 0.35em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.prose-chat pre code {
  display: block;
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: 8px;
  padding: 0.75rem;
  overflow-x: auto;
}

@supports (background: color-mix(in srgb, white 10%, black)) {
  .prose-chat pre code pre code {
    background: color-mix(in srgb, var(--code-bg) 92%, black 8%);
  }
}
```

> Inside errors: keep code on `--code-bg` for legibility; don’t use `--error-bg` for code blocks.

---

## **7) Layout & Container**

```tsx
export function ChatContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-rows-[1fr_auto] h-full bg-bg text-text">
      <div className="overflow-y-auto p-3 space-y-2">{children}</div>
      {/* composer */}
    </div>
  )
}
```

---

## **8) Accessibility & Contrast Rules**

* All text vs. background: ≥ 4.5:1.
* Buttons in error messages: ≥ 3:1 contrast.
* Icon-only states always have a text label.
* Avoid using accent as solid fill for body text unless `--accent-contrast` passes AA.

---

## **9) States & Interactions**

* **Hover**: optional subtle border-emphasis; avoid big background shifts.
* **Focus visible**: outline with `outline-accent` or `outline-error` based on role.
* **Collapsed groups**: use left accent bar for grouped messages from the same participant.

---

## **10) Storybook/Test Matrix**

Test all combinations:

* Theme: light/dark
* Role: self, assistant, user, tool, system, error
* Accents: all
* Error: with/without details, with actions
* Code block inside error
* Screen reader audit

---

If you want, I can now produce the **actual `globals.css`, `tailwind.config.ts`, and `Message.tsx` file implementations** that match this spec so you can drop them directly into your shadcn project.

Do you want me to generate those implementation files next?
