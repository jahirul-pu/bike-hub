# Design Guidelines — Project-wide (for agents and humans)

Purpose: single source of truth for UI/UX decisions and agent behavior when making design changes in this repository.

These guidelines are intended for every automated agent and human contributor to follow so design and implementation remain consistent, accessible, and maintainable.

---

## Quick rules for agents

- **Read this file first.** Before making any UI or design changes, load and follow this document.
- **Follow directory conventions.** Reuse components in `components/ui` and `components/site` rather than creating new copies.
- **Respect local filename style.** Keep the existing casing pattern in each directory:
  - `components/ui`: kebab-case filenames (e.g., `button.tsx`) that export a PascalCase component (e.g., `export function Button()`).
  - `components/site` and `components/admin`: PascalCase filenames (e.g., `BikeCard.tsx`).
- **Prefer composition over copy-paste.** Extend existing primitives (`Card`, `Button`, `Input`) instead of copying markup and styles.
- **Do not add new runtime dependencies** without explicit review/approval. Propose and justify large changes in the PR description.
- **Ask if uncertain.** If a design choice is ambiguous (colors, layout, copy), ask a clarifying question rather than guessing.
- **Include a short design note** in PRs for visual changes: what changed, why, and any trade-offs.

---

## Architecture & component rules

- **Single responsibility.** Each component should do one thing (presentational vs. container separation).
- **Export shape.** Prefer named exports for utility modules; components may use named or default exports but the component name must match the exported symbol.
- **Props typing.** Use explicit TypeScript interfaces for props. Avoid `any`.
- **Files per component.** Keep small related helpers in the same file; larger helpers get their own module under `lib/` or `components/<area>/utils`.

Example component template (site-level):

```tsx
// components/site/BikeCard.tsx
import { Card } from '../ui/card'

export interface BikeCardProps { bike: Bike }

export function BikeCard({ bike }: BikeCardProps) {
  return (
    <Card>
      <h3>{bike.name}</h3>
    </Card>
  )
}

export default BikeCard
```

Example UI primitive template (ui folder):

```tsx
// components/ui/button.tsx
import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'} {...props} />
}

export default Button
```

---

## Styling & tokens

- This repo uses utility CSS and global tokens. Prefer existing utilities and CSS variables in `app/globals.css`.
- **No hard-coded colors or spacing.** Use tokens (CSS variables or Tailwind config) so themes and accessibility changes are easy.
- **Theming.** Support dark/light via CSS variables (`:root` / `.dark`) and prefer those variables in component styles.

### Design Tokens Contract Layer

## Design Tokens (source of truth)

### Colors
- --color-bg-primary
- --color-bg-secondary
- --color-text-primary
- --color-text-muted
- --color-border
- --color-accent

### Spacing (8pt system)
- --space-1: 4px
- --space-2: 8px
- --space-3: 12px
- --space-4: 16px
- --space-6: 24px
- --space-8: 32px

### Radius
- --radius-sm
- --radius-md
- --radius-lg

### Shadows
- --shadow-sm
- --shadow-md
- --shadow-lg

---

## Accessibility (required)

- All visible interactive controls must be keyboard reachable and have focus styles.
- Provide semantic elements (`button`, `nav`, `form`, `header`, etc.) and ARIA attributes when semantics alone are insufficient.
- Ensure color contrast meets WCAG AA for normal text and large text.
- For dynamic content, include appropriate `aria-live` regions or polite announcements.

Checklist for visual PRs:
- Keyboard test: can operate using only keyboard.
- Screen reader labels: set `aria-label` or visible label for every interactive item.
- Focus ring: visible and meets contrast requirements.

---

## Images & performance

- Use Next.js image optimizations when applicable (`next/image`) for public-facing imagery.
- Lazy-load offscreen images and defer heavy assets.
- Avoid shipping large data or images inline; reference optimized assets in `public/`.

---

## UX microcopy

- Keep labels short and actionable (button labels: `Add to cart`, `Save`).
- Error messages must be helpful and actionable (avoid generic "Something went wrong").

---

## Testing and documentation

- Include unit tests for non-trivial logic and accessibility tests when possible.
- Add or update a Storybook story (if present) for significant new components or variants.
- Update `README.md` or component-level docs when behavior or props change.

---

## PR checklist (agents must auto-include / verify)

- Visual diff or screenshots for UI changes (static images or storybook link).
- Accessibility checks documented (keyboard, ARIA labels, contrast).
- Named exports/types reviewed and Prop interfaces typed.
- No new dependencies added without approval.
- If design tokens or global CSS changed, add a short note describing impact.

---

## Agent-specific integration rules

- Agents must not use global-scoped `applyTo: "**"` style instructions that inject unrelated behavior everywhere. Instead target relevant paths when creating automation instructions.
- When an agent modifies UI files, it should:
  1. Reuse primitives from `components/ui`.
 2. Add/Update a small example in `components/site` or a Storybook entry.
 3. Provide a short visual summary (screenshots or story link) in the PR description.

---

## When to escalate

- Major visual refreshes, brand color changes, or introducing new design tokens should be proposed and reviewed by a human designer or maintainer.

---

## Layout System

- Use a consistent max-width container (e.g., 1200px).
- Use a 12-column grid for complex layouts.
- Standard page padding:
  - mobile: px-4
  - tablet: px-6
  - desktop: px-8

### Vertical rhythm
- Section spacing: space-y-12
- Component spacing: space-y-6
- Element spacing: space-y-2 / space-y-3
## Change log

## Component Variants Pattern

All components should support variants when applicable. Variants enable consistent UI permutations and make styling predictable across the app.

- **Size:** `sm | md | lg`
- **Variant:** `primary | secondary | ghost | danger`
- **State:** `default | loading | disabled`

Examples:
- `<Button variant="primary" size="md" />`
- `<Card variant="outlined" />`

Guidelines:
- Implement variants as props that map to CSS utility classes or design tokens rather than ad-hoc inline styles.
- Keep the variant logic inside the component (or a small helper) so consumers only pass props.
- Document available variants in the component's README or Storybook story.
- Ensure each variant maintains accessibility (focus states, contrast, and ARIA where applicable).


## Change log

- 1.0 — Initial guidelines derived from repository patterns and agent customization SKILL.

---

## Interaction States

All interactive elements must define the following states and provide clear visual affordances for each:

- **default** — base appearance
- **hover** — pointer hover state (use color + subtle elevation/opacity)
- **active** — pressed state (slightly reduced scale or inset shadow)
- **focus** — keyboard focus ring (visible, high-contrast outline or ring)
- **disabled** — reduced opacity + no pointer interactions
- **loading** — show spinner or skeleton and disable interactions while async

Avoid state changes that rely on color alone; pair color with at least one of:
- opacity
- scale
- shadow/elevation

State tokens example (map to CSS variables):
- --state-hover-opacity
- --state-active-scale
- --state-focus-ring
- --state-disabled-opacity

---

## Composition Patterns

Prefer building UI using composition and slots. Break components into small, focused pieces that can be assembled by consumers.

Example:

```tsx
<Card>
  <CardHeader />
  <CardContent />
  <CardFooter />
</Card>
```

Avoid monolithic components that bundle too many responsibilities. Favor small composable primitives and light wrapper components that orchestrate them.

## Visual Consistency Rules

- **Border radius must come from tokens only** — use `--radius-*` values; do not hard-code corner radii.
- **Avoid mixing sharp + rounded elements in same section** — pick a visual language per section and apply consistently.
- **Icons must use consistent stroke width** — prefer a single stroke size (e.g., 1.5/2px) across UI icons.
- **Shadows must follow elevation scale** — use `--shadow-sm|md|lg` tokens; do not add ad-hoc or random shadows.

## Data Display

- Use **tables** for structured comparisons (columns, sortable where appropriate).
- Use **cards** for exploratory browsing and summary views.
- Use **badges** for status indicators (e.g., `new`, `popular`, `electric`). Keep badge sizes and colors consistent via tokens.
- Use **progress bars** for ratings or scores (e.g., performance score). Prefer accessible `aria-valuenow` and textual fallbacks.

## Navigation Guidelines

- Primary actions must be visible without scrolling.
- Navigation depth should not exceed 3 levels.
- Highlight active state clearly (use tokens for active color and strong focus).
- Use breadcrumbs for deep pages to provide context and a clear path back.

## Agent Decision Priority

When an automated agent (or contributor) modifies UI, follow this priority to keep the codebase consistent and minimal:

1. Reuse existing component
2. Extend with a variant
3. Compose new structure from primitives
4. Create a new component only if necessary

If multiple options exist, choose the simplest solution that preserves consistency.

## Design Philosophy

The system prioritizes clarity, consistency, and composability. Every UI element should be predictable, reusable, and scalable. Avoid visual noise — prefer structured layouts and purposeful patterns over decorative complexity so the interface remains maintainable and accessible as the product grows.



