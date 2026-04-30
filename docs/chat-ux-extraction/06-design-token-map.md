# 06 - Design Token Map

## Spacing & Layout

- **Global Page Padding:** `px-4 md:px-8`
- **Message List Spacing:** `gap-y-6` between messages.
- **Message Bubble Padding:** `p-4` (Standard) or `px-4 py-3` (Compact).
- **Composer Padding:** `p-3` internal to textarea, `p-4` wrapper.

## Typography (Tailwind values)

- **Base Text:** `text-sm` (14px) for message content.
- **Line Height:** `leading-relaxed` (1.625) for readability of long generations.
- **Metadata (Names, Times):** `text-[11px] font-semibold tracking-wider uppercase`.
- **Code Blocks:** `font-mono text-xs`.

## Radius & Borders

- **Containers:** `rounded-3xl` for the main chat shell (if isolated).
- **Bubbles:** `rounded-2xl`. User messages have `rounded-br-sm`, Assistant has `rounded-bl-sm`.
- **Borders:** `border-white/10` to maintain the glassmorphism aesthetic without heavy lines.

## Motion & Transitions

- **Hover States:** `duration-200 ease-out`.
- **Composer Growth:** `transition-[height] duration-200`.
- **Mount/Unmount (Framer Motion):** `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}`.

## Colors

- **User Bubble:** Muted secondary brand color (e.g., `bg-white/5`).
- **Assistant Bubble:** Muted primary brand color (e.g., `bg-brand-purple/10` or transparent with border).
- **Action Buttons:** `hover:text-brand-cyan hover:bg-white/5`.
