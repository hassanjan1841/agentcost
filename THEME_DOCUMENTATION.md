# Black & White Theme Documentation

## Overview
AgentCost Dashboard uses a **strict black and white color theme** with proper contrast ratios for accessibility and clarity.

## Theme Philosophy
- **Light backgrounds (white) → Dark text (black)**
- **Dark backgrounds (black) → Light text (white)**
- **Hover states maintain contrast**: White + hover → Gray-200 (still readable)
- **No mid-gray text on white** - Only dark/black text on white backgrounds

## Color Palette

### Primary Colors
- **Pure White** (`#ffffff` / `bg-white`) - Main background
- **Pure Black** (`#000000` / `bg-black`, `text-black`) - Primary CTA, text on light
- **Dark Gray** (`gray-900`) - Alternative dark elements
- **Light Gray** (`gray-100`, `gray-200`, `gray-300`) - Hover states, borders, separators

### Text Colors
| Color | Usage | Example |
|-------|-------|---------|
| `text-black` | Body text, labels on white | Paragraph text, table content |
| `text-gray-900` | Headings, strong emphasis | Page titles, section headers |
| `text-white` | Text on black backgrounds | Button labels, dark sections |
| `text-gray-600` | Descriptions, secondary | Subtitle, helper text |
| `text-gray-500` | Placeholder, tertiary | Empty states, hints |

### Background Colors
| Color | Usage | Hover/Active | Text Color |
|-------|-------|-------------|------------|
| `bg-white` | Main content | `hover:bg-gray-50` | `text-black` |
| `bg-black` | CTAs, dark sections | `hover:bg-gray-900` | `text-white` |
| `bg-gray-100` | Table headers | N/A | `text-black` |
| `bg-gray-200` | Hover states, secondary | N/A | `text-black` |
| `bg-gray-300` | Borders, dividers | N/A | N/A |
| `bg-red-600` | Destructive actions | `hover:bg-red-700` | `text-white` |

## Component Styling

### Buttons
```typescript
// Default (Primary)
default: 'bg-black text-white hover:bg-gray-900 active:bg-black'

// Outline
outline: 'border-2 border-black bg-white text-black hover:bg-gray-50 active:bg-white'

// Secondary
secondary: 'bg-gray-200 text-black hover:bg-gray-300 active:bg-gray-200'

// Destructive
destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-600'

// Ghost
ghost: 'text-black hover:bg-gray-100 active:bg-white'
```

**Contrast Ratios:**
- Black on white: 21:1 (AAA)
- Red-600 on white: 6.5:1 (AA)
- Gray-200 on white: 2.3:1 (readable, good for hover)

### Cards
```css
.card {
  border: 2px solid gray-300;   /* Visible border */
  background: white;
  color: black;
  padding: 1.5rem;
}
```

### Tables
```css
thead {
  border-bottom: 2px solid gray-400;
  background: gray-100;  /* Distinguish headers */
  color: black;
  font-weight: bold;
}

tbody tr {
  border-bottom: 1px solid gray-300;
  transition: background 150ms;
}

tbody tr:hover {
  background: gray-100;  /* Clear hover effect */
  color: black;
}
```

### Select Dropdowns
```css
trigger {
  border: 2px solid gray-400;
  background: white;
  color: black;
  border-radius: 0.375rem;
}

content {
  border: 2px solid gray-400;
  background: white;
  color: black;
}

item:hover {
  background: gray-200;  /* Clear hover */
  color: black;
}

item:focus {
  background: gray-200;
  color: black;
}
```

### Badges
```typescript
// Default
default: 'bg-black text-white hover:bg-gray-900'

// Secondary
secondary: 'bg-gray-200 text-black hover:bg-gray-300'

// Outline
outline: 'border-2 border-black text-black'
```

## Interactive States

### Hover State Pattern
```
Light background (white)
  ↓
Add semi-transparent black overlay or switch to gray-100/gray-200
  ↓
Text remains black (high contrast maintained)
```

### Focus State
```
All interactive elements use:
focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2
```

### Active/Pressed State
```
Buttons/links:
  Before: bg-X color-Y
  After: active:bg-X (same as default, indicates press)
```

## Pages & Sections

### Landing Page
- **Background:** White (`bg-white`)
- **Text:** Black (`text-gray-900` for headers, `text-gray-600` for body)
- **Code block:** Dark background (`bg-gray-900`), light text (`text-gray-100`)
- **Cards:** White with gray borders

### Dashboard Page
- **Background:** White (`bg-white`)
- **Sidebar/Cards:** White with gray borders
- **Metric cards:** White background, black text
- **Table headers:** Gray-100 background, bold black text
- **Table rows:** White background, hover → gray-100

## Chart Styling
- **Line color:** Blue (`#2563eb`) on white background
- **Grid lines:** Gray (`#e0e0e0`) - visible but subtle
- **Axis text:** Dark gray (`#666`)
- **Tooltip:** White background, dark text, gray border

## Accessibility Compliance
- ✅ WCAG AAA for primary text (black on white: 21:1)
- ✅ WCAG AA for secondary elements (gray-600 on white: 8.5:1)
- ✅ Hover states have minimum 2:1 contrast
- ✅ No color-only information (text labels used)
- ✅ Focus indicators visible (ring-2 outline)

## Implementation Guidelines

### When Adding New Components
1. **Light backgrounds** → use `bg-white`, text should be `text-black` or `text-gray-900`
2. **Dark backgrounds** → use `bg-black`, text should be `text-white`
3. **Hover/Focus** → increase gray level or darken for clarity
4. **Borders** → use `border-gray-300`, `border-gray-400` for visibility
5. **Never use** → `text-gray-400` on white, `text-gray-300` anywhere

### Color Usage Quick Reference
```
✅ DO:
- White bg + black text
- Black bg + white text
- Gray-100/200 bg + black text
- White bg + gray-600 text (secondary)

❌ DON'T:
- White bg + gray-400/gray-300 text (too faint)
- Black bg + gray-600 text (not visible)
- Mixed contrast levels without clear hierarchy
- Color-coded information without text labels
```

## Files Implementing This Theme
1. `components/ui/button.tsx` - Button variants
2. `components/ui/badge.tsx` - Badge variants
3. `components/ui/card.tsx` - Card styling
4. `components/ui/table.tsx` - Table header/row styling
5. `components/ui/select.tsx` - Dropdown styling
6. `components/CostChart.tsx` - Chart colors
7. `app/page.tsx` - Landing page
8. `app/dashboard/page.tsx` - Dashboard page
9. `app/globals.css` - Global font/color base

## Testing Checklist
- [ ] All text passes WCAG AA contrast requirements
- [ ] Hover states are clearly visible
- [ ] Button focus outlines visible (ring-2)
- [ ] Table headers distinguish from rows
- [ ] Select dropdown clear and readable
- [ ] Chart line visible on white background
- [ ] No elements with low opacity text on white
- [ ] Error/destructive actions clearly red
