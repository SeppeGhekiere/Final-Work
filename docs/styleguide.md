# Style Guide: The Loop

> Design tokens, typography, buttons, and layout conventions.

---

## 1. Colors

All colors are defined as CSS custom properties in `src/styles/variables.css`.

### Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#050403` | Page background |
| `--color-text` | `#eaeaea` | Primary text |
| `--color-text-secondary` | `#8a8a8a` | Muted/secondary text |
| `--color-accent` | `#cd5909` | Primary accent (headings, buttons, links) |
| `--color-accent-hover` | `#b04e08` | Accent hover state |
| `--color-accent-active` | `#8f3d06` | Accent active/pressed state |
| `--color-border` | `rgba(234, 234, 234, 0.12)` | Dividers, card borders |

### Opacity conventions

Muted text uses `opacity: 0.55` directly in CSS rather than a separate token. The `--color-text-secondary` token is a solid approximation for use where `rgba()` is impractical.

---

## 2. Typography

### Font Family

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `"Montserrat", sans-serif` | All body and UI text |
| `--font-mono` | `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace` | Debug panels only |

Loaded via Google Fonts in `index.html`:
- Montserrat: 400, 500, 700

### Type Scale

| Element | Selector | Size | Weight | Line Height | Letter Spacing | Notes |
|---------|----------|------|--------|-------------|----------------|-------|
| Hero heading | `.hero-heading` | `40px` | 400 | `54px` | `-0.015em` | Accent color |
| Page heading | `.project-heading`, `.info-title` | `40px` | 400 | `54px` | `-0.015em` | Accent color |
| Section title | `.project-section-title` | `20px` | 400 | `30px` | `-0.015em` | Accent color |
| Block quote | `.quote-text` | `22px` | 400 | `34px` | `-0.015em` | 0.8 opacity |
| Quote attribution | `.quote-attribution` | `14px` | 400 | `22px` | `-0.015em` | Accent color |
| Body / lede | `.project-lede` | `17px` | 400 | `28px` | — | 0.7 opacity |
| Body / paragraph | `.project-body`, `.subhero-intro`, `.hero-sub`, `.info-text` | `15px` | 400 | `26px` | — | 0.55 opacity |
| Dialogue text | `.dialogue-box p` | `18px` | 400 | `1.6` | — | — |
| Button / nav | `.hero-btn`, `.project-begin-btn`, `.home-nav-start`, `.home-nav-current` | `13px` | 500 | — | `-0.015em` | — |
| Logo | `.home-logo` | `13px` | 400 | — | `0.15em` | Uppercase, 0.5 opacity |
| Choice text | `.choices-grid button` | `16px` | 400 | — | — | — |
| Stat / indicator | `.stat-indicator` | `0.9rem` | 400 | — | — | Italic, 0.8 opacity |
| Reality overlay | `.reality-line` | `1.4rem` | 400 | `1.6` | — | — |
| Debug text | `.debug-stats` | `14px` | 400 | `1.6` | — | Monospace, green |

### Responsive Type Adjustments

| Element | ≥1024px | <1024px | <768px |
|---------|---------|---------|--------|
| `.hero-heading` | `40px` / `54px` lh | `32px` / `44px` lh | `26px` / `36px` lh |
| `.project-heading` | `40px` / `54px` lh | — | `32px` / `44px` lh |
| `.quote-text` | `22px` / `34px` lh | `18px` / `28px` lh | — |
| `.choices-grid button` | `16px` | — | `14px` |

---

## 3. Buttons

Three button variants are used across the site. All share these base styles:

```css
font-family: var(--font-sans);
font-weight: 500;
font-size: 15px;
letter-spacing: -0.015em;
border-radius: var(--radius-md);
cursor: pointer;
transition: background-color 0.2s;
```

### Primary `.hero-btn` / `.project-begin-btn`

Filled accent button, used for primary actions ("Find Out", "Begin").

| State | Styles |
|-------|--------|
| Default | `background: var(--color-accent); color: #fff; border: none; padding: 12px 40px;` |
| Hover | `background: var(--color-accent-hover);` |
| Active | `background: var(--color-accent-active);` |
| Disabled | `background: var(--color-btn-primary-disabled-bg); color: var(--color-btn-primary-disabled-text); cursor: not-allowed;` |

### Secondary (outline)

Bordered accent button, used for secondary actions (e.g. "Continue" in overlays).

| State | Styles |
|-------|--------|
| Default | `background: transparent; color: var(--color-accent); border: 1px solid var(--color-accent); padding: 0.75rem 2rem;` |
| Hover | `background: var(--color-btn-secondary-hover-bg);` |
| Active | `background: var(--color-btn-secondary-active-bg);` |
| Disabled | `border-color: var(--color-btn-secondary-disabled-border); color: var(--color-btn-secondary-disabled-text); cursor: not-allowed;` |

### Ghost

Text-only accent button, used for subtle actions (e.g. nav buttons).

| State | Styles |
|-------|--------|
| Default | `background: transparent; color: var(--color-accent); border: none; padding: 0;` |
| Hover | `background: var(--color-btn-ghost-hover-bg);` (add padding if inline) |
| Active | `background: var(--color-btn-ghost-active-bg);` |
| Disabled | `color: var(--color-btn-ghost-disabled-text); cursor: not-allowed;` |

### Button Examples

```css
/* Primary */
.hero-btn,
.project-begin-btn {
	padding: 12px 40px;
	color: var(--color-btn-primary-text);
	background-color: var(--color-btn-primary-bg);
	border: none;
	border-radius: var(--radius-md);
	cursor: pointer;
	transition: background-color 0.2s;
}

/* Secondary (outline) */
.meta-continue-btn {
	background: transparent;
	border: 1px solid var(--color-btn-secondary-border);
	color: var(--color-btn-secondary-text);
	padding: 0.75rem 2rem;
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition: all 0.3s ease;
}
.meta-continue-btn:hover {
	background: var(--color-btn-secondary-hover-bg);
	border-color: #fff;
	color: #fff;
}

/* Ghost (text-only) */
.home-nav-start {
	font-weight: 500;
	font-size: 13px;
	color: var(--color-btn-ghost-text);
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
}
.home-nav-start:hover {
	text-decoration: underline;
}
```

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Meta overlays, secondary buttons, debug panels |
| `--radius-md` | `6px` | Primary buttons, hero CTA |
| `--radius-lg` | `8px` | Cards, containers (future use) |

---

## 5. Spacing Scale

Values in `px`. Use the CSS custom property for consistency.

| Token | Value | Common Usage |
|-------|-------|--------------|
| `--space-1` | `4` | Grid gaps, small internal padding |
| `--space-2` | `8` | Paragraph margins, tight gaps |
| `--space-3` | `12` | Choice grid gap, compact padding |
| `--space-4` | `16` | Section bottom margin, heading margin |
| `--space-5` | `20` | Quote bottom margin, loose spacing |
| `--space-6` | `24` | Nav link gap, mobile horizontal padding |
| `--space-8` | `32` | Button-to-text gap, tablet padding |
| `--space-10` | `40` | Button padding (vertical), section gap |
| `--space-12` | `48` | Desktop horizontal padding, hero padding |
| `--space-15` | `60` | Hero padding bottom, large section gap |
| `--space-20` | `80` | Top padding for hero/page sections |
| `--space-25` | `100` | Footer padding bottom, generous whitespace |

### Responsive Padding Patterns

```css
/* Desktop */
.hero-10 { padding: 80px 48px 60px; }
          /* 80px = --space-20 top, 48px = --space-12 sides, 60px = --space-15 bottom */

/* Tablet (<1024px) */
@media (max-width: 1024px) {
	.hero-10 { padding: 60px 32px 40px; }
	            /* 60px = --space-15, 32px = --space-8, 40px = --space-10 */
}

/* Mobile (<768px) */
@media (max-width: 768px) {
	.hero-10 { padding: 48px 24px 32px; }
	            /* 48px = --space-12, 24px = --space-6, 32px = --space-8 */
}
```

---

## 6. Layout & Breakpoints

| Breakpoint | Target |
|------------|--------|
| `1024px` | Tablet landscape / small desktop |
| `768px` | Mobile / tablet portrait |

### Max Content Widths

| Container | Max Width | Notes |
|-----------|-----------|-------|
| Hero section | `1100px` | `.hero-10` |
| Project/info content | `680px` | `.project-hero`, `.project-section` |
| Story dialogue | `700px` (60% width) | `.story-container` |
| Choices | `600px` (60% width) | `.choices-container` |

---

## 7. Animations

| Name | Duration | Usage |
|------|----------|-------|
| `fadeIn` | `0.3s` | Stat indicators, choice appearance |
| `metaFadeIn` | `0.5–1.5s` | Meta overlay text |
| `dimFadeIn` | `1s` | Reality overlay dim |
| `shake` | `0.2s infinite` | Screen shake (high tension) |
| `drift` | `continuous` | Choice drift effect |
| `reflectedGlow` | `2s infinite` | Available choice pulse |

Transition defaults: `0.2s` for buttons, `0.3s` for overlays, `0.5s` for sleepiness.

---

## 8. CSS Custom Properties Reference

All design tokens are in `src/styles/variables.css`:

```css
:root {
	/* Colors */
	--color-bg: #050403;
	--color-text: #eaeaea;
	--color-text-secondary: #8a8a8a;
	--color-accent: #cd5909;
	--color-accent-hover: #b04e08;
	--color-accent-active: #8f3d06;
	--color-border: rgba(234, 234, 234, 0.12);

	/* Buttons - Primary */
	--color-btn-primary-bg: var(--color-accent);
	--color-btn-primary-text: #ffffff;
	--color-btn-primary-hover-bg: var(--color-accent-hover);
	--color-btn-primary-active-bg: #8f3d06;
	--color-btn-primary-disabled-bg: rgba(205, 89, 9, 0.35);
	--color-btn-primary-disabled-text: rgba(255, 255, 255, 0.5);

	/* Buttons - Secondary (outline) */
	--color-btn-secondary-border: var(--color-accent);
	--color-btn-secondary-text: var(--color-accent);
	--color-btn-secondary-hover-bg: rgba(205, 89, 9, 0.1);
	--color-btn-secondary-active-bg: rgba(205, 89, 9, 0.2);
	--color-btn-secondary-disabled-border: rgba(205, 89, 9, 0.35);
	--color-btn-secondary-disabled-text: rgba(205, 89, 9, 0.35);

	/* Buttons - Ghost */
	--color-btn-ghost-text: var(--color-accent);
	--color-btn-ghost-hover-bg: rgba(205, 89, 9, 0.08);
	--color-btn-ghost-active-bg: rgba(205, 89, 9, 0.15);
	--color-btn-ghost-disabled-text: rgba(205, 89, 9, 0.35);

	/* Typography */
	--font-sans: "Montserrat", sans-serif;
	--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;

	/* Border Radius */
	--radius-sm: 4px;
	--radius-md: 6px;
	--radius-lg: 8px;

	/* Spacing */
	--space-1: 4px;
	--space-2: 8px;
	--space-3: 12px;
	--space-4: 16px;
	--space-5: 20px;
	--space-6: 24px;
	--space-8: 32px;
	--space-10: 40px;
	--space-12: 48px;
	--space-15: 60px;
	--space-20: 80px;
	--space-25: 100px;
}
```
