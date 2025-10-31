# Design Guidelines: Healthcare Informatics

## Design Approach

**Selected System**: Material Design 3 with healthcare data visualization specialization

**Justification**: Material Design provides excellent patterns for data-dense applications, clear hierarchy for complex information, and robust component libraries for interactive elements. The system's emphasis on structured layouts and responsive grids makes it ideal for displaying medical data, charts, and conversational interfaces.

**Core Principles**:
- Clinical clarity: Information hierarchy optimized for healthcare professionals
- Data-first design: Charts and reports take visual priority
- Conversational intelligence: Chat interface feels natural and responsive
- Professional trust: Clean, credible aesthetic appropriate for medical data

---

## Typography System

**Font Families**:
- Primary: Inter (headings, UI elements, data labels)
- Secondary: IBM Plex Mono (code snippets, data values, technical information)

**Hierarchy**:
- Page Titles: text-3xl font-bold (report titles, dashboard headers)
- Section Headers: text-2xl font-semibold (chart titles, report sections)
- Subsections: text-xl font-medium (category labels, chat timestamps)
- Body Text: text-base font-normal (report content, descriptions)
- Data Labels: text-sm font-medium (chart axes, metric labels)
- Technical Data: text-sm font-mono (FHIR resource IDs, timestamps)
- Captions: text-xs (metadata, helper text)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Application Layout**:
- Split-screen interface: Chat on left (w-96 fixed), report/visualization area on right (flex-1)
- Chat panel: Fixed width, full height, scrollable message area
- Main content area: Responsive, accommodates full-width reports and charts
- Container max-width: max-w-7xl for report content
- Padding: p-6 for main content areas, p-4 for cards

**Responsive Behavior**:
- Desktop (lg+): Side-by-side chat and content
- Tablet (md): Chat collapses to slide-over panel with toggle button
- Mobile: Stack vertically, chat accessible via bottom sheet

---

## Component Library

### Navigation & Structure

**App Header**:
- Fixed top bar: h-16, w-full
- Logo/title on left
- Quick actions on right: New Report button, User menu, Settings icon
- Subtle border-b separation

**Chat Panel**:
- Fixed left sidebar (desktop): w-96, h-screen
- Header: "Chat Interface" title, collapse button
- Message area: flex-1, overflow-y-auto, pb-24
- Input area: Fixed bottom, h-20, textarea with send button
- Spacing: Messages spaced with gap-4, px-4, py-2 per message

### Chat Components

**User Message Bubble**:
- Aligned right: ml-auto, max-w-[80%]
- Rounded container: rounded-2xl rounded-tr-sm
- Padding: px-4 py-3
- Typography: text-base

**AI Response Bubble**:
- Aligned left: mr-auto, max-w-[80%]
- Rounded container: rounded-2xl rounded-tl-sm
- Padding: px-4 py-3
- Typography: text-base
- Loading state: Animated dots (three circles with staggered fade)

**Chat Input**:
- Textarea: min-h-12, max-h-32, resize-none
- Send button: Positioned absolute right, icon-only, rounded-full
- Placeholder: "Describe the report you want to generate..."

### Report Display

**Report Container**:
- Card-based: rounded-xl, p-8
- Shadow: shadow-lg for elevation
- Max width: max-w-5xl centered
- Sections separated with space-y-8

**Report Header**:
- Title: text-3xl font-bold mb-2
- Metadata bar: Flex row with gap-4, text-sm
- Includes: Generated timestamp, data source, record count
- Action buttons: Export PDF, Export JSON, Share (right-aligned)

**Report Sections**:
- Section title: text-2xl font-semibold mb-4
- Content wrapper: space-y-4
- Data tables: Full width, striped rows, sticky headers
- Key metrics: Grid layout (grid-cols-2 md:grid-cols-4 gap-4)

### Data Visualization

**Chart Containers**:
- Wrapper: rounded-lg, p-6
- Title above chart: text-xl font-semibold mb-4
- Chart area: aspect-video or aspect-square as appropriate
- Legend: Below chart, horizontal layout with gap-3
- Spacing between charts: space-y-8

**Metric Cards**:
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Card structure: rounded-lg, p-6
- Label: text-sm font-medium mb-1
- Value: text-4xl font-bold mb-2
- Trend indicator: text-sm with arrow icon
- Minimum height: min-h-32

### Interactive Elements

**Buttons**:
- Primary action: px-6 py-3, rounded-lg, text-base font-semibold
- Secondary action: px-4 py-2, rounded-lg, text-sm font-medium
- Icon buttons: w-10 h-10, rounded-full, icon centered
- Text buttons: Underline on hover, text-base

**Form Inputs** (for FHIR server config):
- Text input: h-12, px-4, rounded-lg, border-2
- Label: text-sm font-medium mb-2, required indicator (*)
- Helper text: text-xs below input, mt-1
- Error state: Red border, error message in text-xs

**Loading States**:
- Skeleton loaders: Animated pulse, rounded shapes matching content
- Spinner: Center of container, w-12 h-12 circular animation
- Progress bar: h-2, rounded-full, animated from left to right

### Data Tables

**Table Structure**:
- Wrapper: overflow-x-auto, rounded-lg
- Header row: Sticky top, h-12, font-semibold, text-sm
- Data rows: h-14, text-base, hover state for interactivity
- Cell padding: px-4
- Striped rows for readability
- Sortable columns: Arrow icon in header

### Overlays & Modals

**Modal Dialogs**:
- Overlay: Fixed inset-0, backdrop blur
- Dialog: max-w-2xl, rounded-2xl, p-8, centered
- Header: text-2xl font-bold mb-6
- Footer: Flex justify-end gap-3, pt-6, border-t

**Slide-Over Panel** (mobile chat):
- Fixed right, w-full md:w-96
- Height: h-full
- Slide animation from right
- Close button: top-right, icon-only

---

## Images

**Dashboard Hero Section** (Optional Empty State):
When no reports are generated yet, display a centered empty state with:
- Illustration: Medical data visualization concept (charts, healthcare icons)
- Dimensions: max-w-md, centered
- Placement: Center of main content area
- Supporting text below image explaining how to get started

**Chart Placeholders**:
When loading, use skeleton shapes that match chart dimensions (aspect-video for line/bar charts, aspect-square for pie charts)

---

## Accessibility & Interactions

**Focus States**:
- All interactive elements: 2px outline with offset
- Keyboard navigation: Visible focus ring
- Skip links: "Skip to main content" at top

**ARIA Labels**:
- Chat messages: role="log", aria-live="polite"
- Charts: Proper aria-label with data summary
- Buttons: Clear aria-label for icon-only buttons

**Animations**: Minimal, purposeful only
- Chat message fade-in: 200ms ease
- Chart data transitions: 300ms ease-out
- Loading spinners: Continuous rotation
- Modal/panel entrance: 200ms slide/fade

---

## Key Layout Specifications

**Desktop Layout**:
```
[Header - 16px height]
[Chat Panel - 384px width] [Main Content Area - flex-1]
```

**Report Layout**:
```
[Report Header with actions]
[Key Metrics Grid - 4 columns]
[Chart Section 1 - full width]
[Chart Section 2 - full width]
[Data Table - full width]
```

**Spacing Rhythm**:
- Between major sections: space-y-12
- Between related elements: space-y-6
- Between cards in grid: gap-6
- Content padding: p-6 to p-8
- Message spacing: gap-4

This design creates a professional, data-centric healthcare application with clear information hierarchy, intuitive chat interaction, and robust visualization capabilities.