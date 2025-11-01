# Healthcare Informatics

## Overview

This AI-powered healthcare analytics application generates comprehensive reports and visualizations from FHIR (Fast Healthcare Interoperability Resources) data. It features a conversational chat interface for natural language report requests and an AI system that analyzes real-time FHIR data to produce insights, metrics, and interactive charts. The system connects to public FHIR servers (HAPI FHIR R4) to process healthcare data (patients, observations, conditions) and uses AI to generate meaningful, user-tailored reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite.
**UI Component System**: shadcn/ui components (Radix UI primitives), following Material Design 3 for clinical clarity and data-first presentation.
**State Management**: TanStack Query for server state, React hooks for local state.
**Routing**: wouter for client-side routing.
**Styling**: Tailwind CSS with custom healthcare-focused design tokens, supporting light/dark modes. Typography uses Inter and IBM Plex Mono.
**Layout Pattern**: Three-column layout: collapsible session sidebar (left), chat panel (middle), flexible report display (right).
**Data Visualization**: Apache ECharts (echarts-for-react) for Power BI-style interactive visualizations with rich chart types, tooltips, legends, and drill-down capabilities.
**Dashboard System**: react-grid-layout for drag/drop/resize tile-based layouts with persistent grid configurations.
**Filter State Management**: Zustand store for cross-chart filter synchronization and reactive data updates.
**Theme Management**: Custom ThemeProvider persists theme selection to localStorage.

### Backend Architecture

**Runtime**: Node.js with Express.js.
**Language**: TypeScript with ES modules.
**API Design**: RESTful endpoints with JSON payloads; `/api/generate-report` for natural language requests.
**Request Validation**: Zod schemas for runtime type checking and input validation.
**Error Handling**: Centralized with specific error types (FHIR_ERROR, AI_ERROR, UNKNOWN_ERROR).
**Session Management**: Multi-session chat with in-memory storage for conversation history and FHIR data caching (10-minute TTL).

### Data Storage Solutions

**Storage**: In-memory MemStorage class using Map structures for development, handling sessions, messages, reports, and FHIR cache.
**Schema Design**: `chatSessions` (metadata), `messages` (chat history), `reports` (generated reports with chart data and metrics), `fhirCache` (cached FHIR responses with TTL).
**Data Persistence**: Messages and reports are persisted to sessions; FHIR cache entries expire after 10 minutes.

### API Integration Patterns

**FHIR Client Pattern**: Axios-based client for HAPI FHIR R4 with comprehensive data fetching capabilities:
- Automatic pagination following FHIR pagination links (100 records per page)
- Configurable limits: 500 patients, 1000 observations, 1000 conditions (default)
- 15-second timeout per request with graceful error handling
- 10-minute TTL caching for performance optimization

**FHIR Data Aggregation**: Smart aggregation system reduces data payload from ~270KB to ~2-5KB before AI processing:
- Patient demographics: gender distribution, age groups (0-18, 19-30, 31-50, 51-70, 70+), average/median age
- Observations: category counts, top 10 common tests with frequencies
- Conditions: top 15 conditions, severity distribution
- Includes 5 sample records per resource type for context

**AI Client Pattern**: Structured prompts with aggregated FHIR data instead of raw records, expecting JSON responses with predefined schema (title, content, metrics, chartData). Implements retry logic with exponential backoff for rate limit handling.

**Data Flow**: User message → FHIR resource determination → Fetch comprehensive datasets (500-1000 records) → Aggregate to statistics → Send aggregated data to AI → Parse AI response → Storage → Client display with visualizations.

### Design System

Material Design 3 with healthcare specialization. Emphasizes clinical clarity, data-first visual priority, conversational chat interface, and professional aesthetic. Uses HSL values with CSS custom properties for theme support, standardized Tailwind spacing, and custom border radii. Persistent dark/light mode toggle with localStorage sync.

### Interactive Visualization System

**Power BI-Style Dashboard**: Two-view system with tabbed interface:
- **Traditional View**: Narrative report with metrics and static charts
- **Interactive Dashboard**: Grid-based layout with draggable/resizable tiles, filters, and reactive visualizations

**Filtering Architecture**:
- FilterPanel component with multiselect controls (gender, age groups, conditions, date ranges)
- Zustand store (`useFilterStore`) for centralized filter state management
- `applyFiltersToDataset()` transforms sourceData based on active filters
- `recalculateAllMetrics()` and `recalculateAllCharts()` regenerate visualizations from filtered data
- React useMemo hooks ensure efficient re-rendering on filter changes

**Chart Types & Interactivity**:
- Demographic charts: Gender distribution (pie), Age distribution (bar)
- Clinical charts: Condition prevalence (bar), Observation categories (bar), Severity distribution (pie)
- All charts support: interactive legends, rich tooltips, drill-down capabilities, zoom/pan controls
- Charts automatically recalculate data when filters are applied

**Data Transformation Layer** (`reportTransform.ts`):
- Heuristic-based chart/metric identification using ID and title keywords
- Handles filtering for demographics, observations, conditions, and severity data
- Gracefully falls back to original data when transformation doesn't apply
- Supports edge cases where data types are missing (e.g., observations=0)

**Grid Layout System**:
- react-grid-layout with 12-column responsive grid
- Configurable row height (default: 80px) and margins (16px)
- Tile types: narrative, metric, chart
- Layout metadata persisted in report schema for consistency across sessions
- Support for drag, drop, and resize interactions

**AI Resilience**: AI prompt updated (Nov 2025) to generate comprehensive reports even when specific data types are unavailable. Always generates minimum 3-4 metrics and 2-3 charts from available data (patients, conditions, observations).

## External Dependencies

**FHIR Data Source**: Public HAPI FHIR R4 server (https://hapi.fhir.org/baseR4) for Patients, Observations, and Conditions.
**AI Integration**: Replit AI Integrations service (OpenAI-compatible API, GPT-5 model) for request analysis, report generation, conversational responses, and includes rate limiting with retry logic (p-retry) and concurrency limiting (p-limit).
**PDF Generation**: jsPDF for client-side PDF export.
**Development Tools**: Replit-specific plugins for development banner, error overlay, and cartographer integration.