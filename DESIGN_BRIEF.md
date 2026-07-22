# Brand Guard Landing Page Redesign — Design Brief

## Research References Studied

### Product Storytelling References

| Website | Section Studied | What Makes It Effective | Principle for Brand Guard | What Must Not Be Copied | How to Transform |
|---------|----------------|------------------------|--------------------------|------------------------|------------------|
| **Linear** | Hero + feature grid | Terse headline, product screenshots in bento grid, dark background makes UI pop | Lead with product UI, not illustrations | Exact bento grid layout, purple color scheme | Use Brand Guard's own extraction UI as hero visual |
| **Raycast** | Hero + extensions | Cinematic product demo looping in hero, red accent on dark | Show product in action immediately | Exact animation style, red accent | Show brand extraction happening in real-time |
| **Stripe** | Full page | Editorial typography (Sohne weight 300), gradient mesh, shadow stacking, narrow reading columns | Light weight display type, restrained accent usage | Purple gradient, Sohne font, exact shadow formula | Use Manrope light weights, warm gradient selectively |
| **Framer** | Hero + gallery | Real product previews, minimal nav, dark mode as default | Product-first approach | Framer-specific branding | Show extracted brand tokens as the hero visual |
| **Vercel** | Hero | One confident headline, deployment animation, black/white/gray | Confidence through simplicity | Exact三角形 logo animation | Simple, direct headline with extraction action |
| **Resend** | Hero + features | Warm dark palette, editorial copy, product screenshots | Warmth in technical product | Exact purple tones | Warm charcoal (#222222) with orange/gold accent |
| **Attio** | Hero | "Customer relationship magic" headline, real dashboard screenshot | Benefit-driven headline over feature list | Exact phrasing | "Keep every design on-brand" is already strong |

### Creative & Luxury References

| Website | Section Studied | What Makes It Effective | Principle for Brand Guard | What Must Not Be Copied | How to Transform |
|---------|----------------|------------------------|--------------------------|------------------------|------------------|
| **Awwwards dark collections** | Various | Warm charcoal bases, tonal contrast, no neon | Dark ≠ black; use warm grays | Neon accents, excessive glow | #222222 base with #FF6B4A accent |
| **Siena Film Foundation** | Full page | Editorial typography, cinematic pacing, filmstrip slider | Editorial rhythm for tech product | Film-specific imagery | Use extraction stages as "filmstrip" |
| **Isabel Moranta portfolio** | Gallery | Monospace for precision, serif for personality | Typography tells brand story | Exact font pairing | Manrope for brand, IBM Plex Mono for data |
| **Stripe Press** | Publishing | Long-form editorial, cultural authority, restraint | Content depth builds trust | Book publishing approach | Show extraction depth, not just surface |
| **Luxury fashion sites** | Product pages | High contrast imagery, generous whitespace, minimal UI | Restraint = premium | Fashion imagery | Let product UI be the hero |
| **Design studios** | Portfolios | Asymmetric layouts, bold type, controlled chaos | Creative confidence | Exact layouts | Vary section rhythm throughout page |

---

## Three Art Directions

### Direction 1: "The Extraction Theater"

**Visual Concept**
The page reads like a performance. A website enters from one side, passes through Brand Guard's extraction process (visualized as a translucent inspection frame), and emerges as structured brand tokens on the other side. The hero shows this transformation happening.

**Hero Composition**
- Left 60%: Large headline in Manrope weight 300
- Right 40%: Animated extraction visual — a website being decomposed into color swatches, font specimens, and logo fragments
- Below hero: URL input with "Extract my brand" CTA

**Page Rhythm**
1. Hero (transformation visual)
2. Problem statement (brand drift) — editorial, text-heavy, asymmetric
3. Extraction demo (sticky scroll) — product takes over full width
4. Brand system assembly — tokens locking into place
5. Before/after comparison — split screen
6. Scoring visualization — large number with breakdown
7. Pricing — minimal, two tiers
8. Final extraction CTA

**Typography Approach**
- Headlines: Manrope weight 300, 64-80px, tight tracking
- Body: Manrope weight 400, 18px, relaxed line-height
- Data: IBM Plex Mono for all extracted values
- One editorial display moment per section

**Product-Demo Treatment**
The extraction process is shown as a 3-step animation:
1. URL enters → website screenshot appears
2. Scan line passes → tokens emerge (colors, fonts, logos)
3. Tokens assemble → brand profile card forms

**Motion Language**
- Scan line revealing tokens (purposeful scanning motion)
- Values locking into place (snap-to-grid)
- Numbers counting when entering viewport
- No ambient animation, no glow

**Conversion Strategy**
- URL input appears 3 times (hero, mid-page, final)
- CTAs: "Extract my brand", "See it in action", "Analyze your site"
- Social proof woven throughout (not a separate section)

**Risks**
- Extraction animation may be complex to implement
- Sticky scroll requires careful mobile handling
- May feel too "tech demo" if not balanced with editorial moments

---

### Direction 2: "The Brand Autopsy" (SELECTED)

**Visual Concept**
Brand Guard performs a careful examination of a website's visual identity — like a forensic analysis, but warm and intelligent. The page reveals what's hidden inside every website: a brand system waiting to be discovered. Each section peels back another layer.

**Hero Composition**
- Full-width, centered
- Large headline: "Every website has a brand inside"
- Subheadline explaining extraction
- URL input as the primary action
- Below: A deconstructed website showing extracted tokens floating into organized groups

**Page Rhythm**
1. Hero — discovery moment (centered, spacious)
2. The problem — brand drift (editorial, left-aligned, asymmetric)
3. What we extract — visual specimen sheet (grid of tokens)
4. The extraction — step-by-step reveal (scrolling narrative)
5. Before/after — current vs corrected (split composition)
6. Exact corrections — annotation system (product UI with callouts)
7. Brand score — large number with category breakdown
8. Pricing — simple, benefit-led
9. Final extraction — URL input again

**Typography Approach**
- Headlines: Manrope weight 700, 48-64px, normal tracking
- Accent words: gradient text for key terms
- Body: Manrope weight 400, 17px
- Code/values: IBM Plex Mono weight 500
- Section labels: IBM Plex Mono weight 400, 12px, uppercase, muted

**Product-Demo Treatment**
Show realistic Brand Guard interface scenes:
- Extraction progress with actual stages
- Detected palette with real hex values
- Typography hierarchy with actual font names
- Logo variants with confidence scores
- Before/after with specific corrections

**Motion Language**
- Scroll-triggered reveals (text and UI elements)
- Token assembly (pieces coming together)
- Value transitions (wrong → correct)
- Score counting animation
- Reduced motion: all animations become instant cuts

**Conversion Strategy**
- Hero URL input is the primary conversion
- Mid-page: "See a sample report" secondary action
- Each section builds desire for the product
- Final CTA: "Extract your brand now"

**Risks**
- Requires careful pacing to avoid feeling like a tutorial
- Annotation system needs precise positioning
- Mobile layout needs significant adaptation

---

### Direction 3: "The Specification"

**Visual Concept**
Brand Guard turns subjective design into objective specification. The page itself follows strict design rules — demonstrating the product's value through its own execution. Every color, font, and spacing choice is intentional and documented.

**Hero Composition**
- Left 50%: Bold headline in Manrope weight 800
- Right 50%: Live brand specification card showing extracted values
- Background: subtle grid pattern suggesting precision

**Page Rhythm**
1. Hero — specification meets extraction
2. The chaos — examples of brand inconsistency (visual chaos)
3. The system — brand tokens as specification (technical, precise)
4. The comparison — side-by-side with annotations
5. The score — weighted breakdown visualization
6. The workflow — 3 steps with product UI
7. Pricing — clean, two options
8. CTA — extraction input

**Typography Approach**
- Headlines: Manrope weight 800, 56-72px
- Technical labels: IBM Plex Mono weight 500
- Body: Manrope weight 400, 16px
- Numbers: IBM Plex Mono weight 600, tabular figures

**Product-Demo Treatment**
Show specification-style interface:
- Color tokens with hex, role, and confidence
- Typography specimens with weights and sizes
- Spacing scale visualization
- Component style specifications

**Motion Language**
- Grid-based animations (snapping to grid)
- Specification values appearing sequentially
- Comparison slider for before/after
- Minimal, purposeful movement

**Conversion Strategy**
- Product itself demonstrates value
- URL input appears at key decision points
- Technical audience will appreciate precision

**Risks**
- May feel too technical for non-designer audience
- Grid aesthetic could become repetitive
- Less emotional than Direction 2

---

## Selected Direction: "The Brand Autopsy"

### Rationale

Direction 2 was selected because:

1. **Product-specific**: The "discovery" metaphor directly maps to extraction — revealing what's hidden
2. **Emotional + technical**: Balances warmth (autopsy = careful examination) with precision (exact corrections)
3. **Memorable visual idea**: "Every website has a brand inside" is a distinctive headline
4. **Conversion-optimized**: Multiple URL input opportunities without feeling pushy
5. **Mobile-friendly**: Centered hero and stacked sections adapt well
6. **Original**: Not a generic SaaS template — the forensic angle is unique

### Final Visual Concept

**The Brand Autopsy** — Brand Guard performs a careful, intelligent examination of your website's visual identity. The page reveals layers: what's visible, what's hidden, what's wrong, and how to fix it. Warm, editorial, premium.

### Page Structure

```
1. NAVIGATION
   - Logo (left)
   - Links: How it works, Pricing
   - CTA: Extract my brand

2. HERO — "Every website has a brand inside"
   - Headline (Manrope 700, 64px, #FFF8F2)
   - Subheadline (Manrope 400, 18px, #D0C2B8)
   - URL input + "Extract my brand" button
   - Visual: Deconstructed website showing extracted tokens

3. THE PROBLEM — "Brand drift happens silently"
   - Editorial section, asymmetric layout
   - Left: Large statement text
   - Right: Example of brand inconsistency
   - Background: #1B1A19

4. WHAT WE EXTRACT — Visual specimen sheet
   - Grid showing: Colors, Fonts, Logos, Spacing, Components
   - Each item is a real extracted token
   - Background: #222222

5. THE EXTRACTION — 3-step narrative
   - Step 1: "Paste your URL"
   - Step 2: "We analyze every pixel"
   - Step 3: "Your brand profile emerges"
   - Each step has a product UI scene
   - Scroll-triggered reveals

6. BEFORE & AFTER — Split composition
   - Left: Current design with issues
   - Right: Corrected design
   - Annotations showing specific changes

7. EXACT CORRECTIONS — Annotation system
   - Product UI showing detected vs approved
   - Specific hex codes, font names, values
   - Confidence scores in IBM Plex Mono

8. BRAND SCORE — Large visualization
   - Score: 87/100 (example)
   - Category breakdown: Color, Typography, Logo, Spacing
   - Progress bars with gradient accent

9. PRICING — Simple, benefit-led
   - Free: 10 checks/month
   - Pro: $5/month, unlimited
   - CTA: "Start free"

10. FINAL CTA — "Extract your brand now"
    - URL input
    - Trust indicators
```

### Responsive Behavior

**Desktop (1200px+)**
- Max-width: 1200px
- 12-column grid
- Generous whitespace
- Side-by-side compositions

**Tablet (768px-1199px)**
- Max-width: 100%
- 8-column grid
- Stacked compositions
- Reduced whitespace

**Mobile (< 768px)**
- Single column
- Stacked everything
- Larger touch targets
- Simplified animations

### Motion System

| Element | Animation | Duration | Easing | Reduced Motion |
|---------|-----------|----------|--------|----------------|
| Hero text | Fade up + slight scale | 600ms | cubic-bezier(0.16, 1, 0.3, 1) | Instant appear |
| Section reveals | Scroll-triggered fade up | 400ms | ease-out | Instant appear |
| Token assembly | Snap to grid | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Instant appear |
| Score counter | Count up from 0 | 1200ms | ease-out | Show final number |
| Before/after | Slide divider | 400ms | ease-in-out | Show both states |
| Values transition | Crossfade | 200ms | ease | Instant switch |

### Color Application

```
Background layers:
- #1B1A19 — Deep sections (problem, extraction)
- #222222 — Main background
- #2A2725 — Elevated surfaces (cards, UI scenes)
- #332D29 — Interactive surfaces (hover states)

Text hierarchy:
- #FFF8F2 — Headlines, primary text
- #D0C2B8 — Body text, descriptions
- #9F9086 — Labels, captions, muted

Gradient accent (selective):
- Primary CTAs
- Active indicators
- Key numerical highlights
- Score visualization
- Small structural accents only
```

### Files to Change

1. `apps/web/src/index.css` — Dark theme tokens, new component classes
2. `apps/web/src/pages/LandingPage.tsx` — Complete rewrite
3. `apps/web/tailwind.config.ts` — Extended color palette

### Reused Existing Components

- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- All Radix UI primitives
- Tailwind CSS utilities
- existing routing structure

---

## Quality Control Checklist

- [x] Could this belong to any other AI SaaS? **No** — the extraction metaphor is specific to brand identity
- [x] Hero visual specific to brand extraction? **Yes** — deconstructed website showing tokens
- [x] Memorable visual idea? **Yes** — "Every website has a brand inside"
- [x] Every section has reason to exist? **Yes** — each builds the narrative
- [x] Too many cards? **No** — varied composition throughout
- [x] Enough negative space? **Yes** — editorial pacing
- [x] Layout changes rhythm? **Yes** — centered, asymmetric, split, full-width
- [x] Gradient used selectively? **Yes** — CTAs and key moments only
- [x] Glow effects removed? **Yes** — none present
- [x] Product visuals meaningful? **Yes** — real extraction UI
- [x] Interactions communicate product? **Yes** — extraction process shown
- [x] Mobile intentionally designed? **Yes** — responsive breakpoints defined
- [x] References transformed? **Yes** — principles borrowed, not copied
