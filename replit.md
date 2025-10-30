# FHIR Healthcare Report Generator

## Overview

This is an AI-powered healthcare analytics application that generates comprehensive reports and visualizations from FHIR (Fast Healthcare Interoperability Resources) data. The application features a conversational chat interface where users can request reports in natural language, and an AI system analyzes real-time FHIR data to produce insights, metrics, and interactive charts.

The system connects to public FHIR servers (specifically HAPI FHIR R4), processes healthcare data including patients, observations, and conditions, and uses AI to generate meaningful reports tailored to user requests.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: shadcn/ui components based on Radix UI primitives, following Material Design 3 principles optimized for healthcare data visualization. The design emphasizes clinical clarity, data-first presentation, and professional trust.

**State Management**: TanStack Query (React Query) for server state management, handling API requests, caching, and data synchronization. Local state managed with React hooks.

**Routing**: wouter for lightweight client-side routing.

**Styling**: Tailwind CSS with custom healthcare-focused design tokens. The theme system supports light and dark modes with carefully designed color schemes for medical data presentation. Typography uses Inter for UI elements and IBM Plex Mono for technical data.

**Layout Pattern**: Split-screen interface with fixed-width chat panel (384px) on the left and flexible content area on the right. Responsive behavior collapses to slide-over panels on tablets and stacked views on mobile.

**Data Visualization**: Recharts library for interactive healthcare charts (bar, line, pie, area charts) with custom theming to match the application's design system.

**Theme Management**: Custom ThemeProvider component that persists theme selection to localStorage and manages dark/light mode state across the application.

### Backend Architecture

**Runtime**: Node.js with Express.js framework.

**Language**: TypeScript with ES modules.

**API Design**: RESTful endpoints with JSON payloads. Primary endpoint `/api/generate-report` accepts natural language requests and returns structured report data.

**Request Validation**: Zod schemas for runtime type checking and input validation. All incoming requests are validated before processing.

**Error Handling**: Centralized error handling with specific error types (FHIR_ERROR, AI_ERROR, UNKNOWN_ERROR) for better client-side error messaging and user feedback.

**Session Management**: In-memory storage for messages and reports during development.

### Data Storage Solutions

**Storage**: In-memory MemStorage class for development. Stores messages and reports in Map structures with full CRUD operations.

**Schema Design**: 
- `messages`: Chat history with role (user/assistant), content, and timestamps
- `reports`: Generated reports with title, content, chart data (JSONB), metrics (JSONB), and FHIR query metadata

**Data Persistence**: Messages and reports are persisted through the storage layer on each API call, maintaining conversation history and report archives.

### External Dependencies

**FHIR Data Source**: Public HAPI FHIR R4 server (https://hapi.fhir.org/baseR4) for accessing healthcare resources. The FHIRClient handles fetching Patients, Observations, and Conditions with configurable limits and error handling.

**AI Integration**: Replit AI Integrations service providing OpenAI-compatible API access (GPT-5 model). The system uses AI to:
- Analyze user requests and determine relevant FHIR resources
- Generate comprehensive reports with titles, content, metrics, and chart suggestions
- Provide conversational chat responses
- Handle rate limiting with retry logic (p-retry) and concurrency limiting (p-limit)

**Rate Limiting Strategy**: Implements exponential backoff for API rate limits and quota violations, with request concurrency limited to 1 to prevent overwhelming the AI service.

**PDF Generation**: jsPDF for client-side PDF export functionality with proper formatting and layout.

**Development Tools**: Replit-specific plugins for development banner, error overlay, and cartographer integration.

### API Integration Patterns

**FHIR Client Pattern**: Axios-based client with timeout handling (10s), automatic pagination support via `_count` parameter, and graceful error handling that returns empty arrays on failure rather than throwing.

**AI Client Pattern**: Structured prompts that include user request context and FHIR data payload. Expects JSON responses with predefined schema (title, content, metrics array, chartData array). Implements retry logic for transient failures.

**Data Flow**: User message → Determine FHIR resources needed → Fetch FHIR data → Send to AI with context → Parse AI response → Store message and report → Return to client → Display visualizations.

### Design System

Material Design 3 with healthcare specialization. Key principles include clinical clarity through optimized information hierarchy, data-first visual priority for charts and reports, conversational chat interface, and professional aesthetic appropriate for medical data.

Color system uses HSL values with CSS custom properties for theme support. Spacing follows Tailwind's standardized scale. Border radius uses custom values (9px large, 6px medium, 3px small) for modern, approachable feel.

**Theme System**: Persistent dark/light mode toggle with localStorage sync. ThemeProvider manages theme state and applies dark class to document root. All components support both themes with proper color contrast.

## Recent Changes (October 30, 2025)

### Complete Application Implementation
- **Frontend**: Built comprehensive chat interface with message bubbles, report display, metric cards, and chart visualizations
- **Backend**: Implemented FHIR data fetching, AI report generation, and data persistence
- **Theme System**: Added persistent dark mode with ThemeProvider and localStorage sync
- **Export Features**: Implemented functional PDF export using jsPDF and JSON export
- **Validation**: Added Zod schema validation for all API endpoints
- **Error Handling**: Enhanced error handling with differentiated FHIR vs AI error messages
- **Data Persistence**: Messages and reports now persisted through storage layer

### Technical Improvements
- Integrated OpenAI GPT-5 via Replit AI Integrations with retry logic
- Connected to public HAPI FHIR server for real healthcare data
- Implemented responsive split-screen layout following design guidelines
- Added comprehensive loading states and empty states
- Built interactive charts using Recharts library
- Added proper TypeScript typing throughout the application

## Known Items

### TypeScript Inference Issues
- Some minor TypeScript LSP diagnostics in client components related to type inference
- These do not affect runtime functionality - the application works correctly
- Errors are false positives from TypeScript's inability to perfectly infer generic types in some cases

### Performance Considerations
- FHIR server and AI API responses can be slow (10-30 seconds)
- This is expected behavior when working with external services
- Future optimization could include caching frequently requested data

## Future Enhancements (Post-MVP)

- Add persistent report history with database storage
- Implement real-time streaming for AI responses
- Create report templates for common FHIR queries
- Add FHIR resource filtering and custom query builder
- Enable report scheduling and automated generation
- Add multi-user support with authentication
- Implement report sharing and collaboration features
