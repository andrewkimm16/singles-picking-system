# New Kawaii – Brand Guidelines (Singles App)

## 1. Brand Essence

### Positioning
New Kawaii is a **community-first hobby store** that blends:
- competitive TCG play
- casual gaming
- collectibles
- family-friendly experiences

It is not a hardcore-only card shop — it is:
> fun, welcoming, and approachable for all levels

---

### Core Brand Traits

- Playful
- Welcoming
- Community-driven
- Colorful (but not chaotic)
- Organized fun (important for your UI)

---

### Brand Voice

**Tone:**
- Friendly
- Encouraging
- Slightly playful
- Never overly technical or sterile

**Examples:**
- ✅ “Find your next favorite card”
- ✅ “Build your deck”
- ❌ “Execute inventory query”
- ❌ “Select SKU variant”

---

## 2. Visual Identity

### Overall Style

- Clean Shopify layout
- Light background
- Bright, colorful product imagery
- Soft, friendly feel
- Lots of white space

---

## 3. Color Guidelines (Inferred)

> NOTE: Exact hex values should be pulled from CSS later if needed

### Primary Palette (Recommended Approximation)

- Background: `#FFFFFF`
- Primary Text: `#111111`
- Secondary Text: `#555555`

### Accent Colors (Kawaii-inspired)

Use sparingly:

- Soft Pink: `#FEC5E5`
- Light Purple: `#D0BFFF`
- Sky Blue: `#A5D8FF`
- Mint: `#B2F2BB`

### Usage Rules

- Keep UI mostly neutral
- Use color for:
  - buttons
  - hover states
  - highlights
- Avoid overwhelming color blocks

---

## 4. Typography

### Style

- Clean sans-serif
- Modern, readable
- Slightly rounded if possible

### Suggested Fonts

- Inter (safe default)
- Poppins (slightly more playful)
- Nunito (more kawaii-friendly)

---

### Hierarchy

- H1: Bold, large, welcoming
- H2: Clean, structured
- Body: Highly readable
- Avoid dense text blocks

---

## 5. Layout Principles

### Shopify-Like Layout

Your singles app should feel like an extension of their site:

- Top navigation bar
- Grid-based product listings
- Simple filters on side/top
- Clean card tiles

---

### Key Patterns

#### Product Grid
- Image first
- Name
- Price
- Minimal metadata

#### Cards
- Rounded corners
- Subtle shadows
- Hover effect

#### Spacing
- Generous padding
- Avoid cramped UI

---

## 6. Imagery & Content

### Product Imagery

- High-quality card images
- Clean backgrounds
- No clutter

---

### Content Style

- Short
- Clear
- Friendly

Examples:

- “NM – Near Mint”
- “LP – Light Play”
- “Foil”
- “Only 2 left”

---

## 7. Singles App UX Guidelines

This is where you tie everything together.

---

### A. Entry Experience

When users land on `singles.store.com`:

- MUST feel like same brand
- Keep:
  - logo (if accessible)
  - nav styling
  - spacing patterns

---

### B. Search Experience

Should feel:

- fast
- forgiving
- intuitive

Placeholder text:

> “Search for cards (e.g. Lightning Bolt, Pikachu…)”

---

### C. Cart Experience

- Clean, simple drawer or page
- No clutter
- Clear totals

---

### D. Checkout Button

IMPORTANT:

Make this feel like continuation of Shopify:

- Primary button style
- Clear CTA:
  - “Checkout”
  - “Proceed to Payment”

---

## 8. Microcopy Guidelines

Use **friendly + human language**

### Good
- “Added to cart”
- “Only 1 left”
- “Out of stock”
- “We couldn’t find this card”

### Avoid
- “Error: inventory mismatch”
- “Invalid selection”

---

## 9. Brand Alignment Rules

### DO

- Match spacing and layout style
- Keep UI light and approachable
- Use playful but controlled color accents
- Prioritize readability

---

### DO NOT

- Over-theme with anime/kawaii visuals
- Add heavy gradients or neon
- Make it look like a different product
- Overcomplicate UI

---

## 10. Implementation Notes

### For Dev

- Build reusable theme config:

```ts
theme = {
  borderRadius: "12px",
  spacing: "comfortable",
  font: "Inter",
  accentColors: ["#FEC5E5", "#A5D8FF"]
}