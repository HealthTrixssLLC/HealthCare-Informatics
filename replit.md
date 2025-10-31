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
**Data Visualization**: Recharts library for interactive healthcare charts (bar, line, pie, area) with custom theming.
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

**FHIR Client Pattern**: Axios-based client for HAPI FHIR R4, with timeout, automatic pagination, and graceful error handling.
**AI Client Pattern**: Structured prompts including user request and FHIR data payload, expecting JSON responses with predefined schema (title, content, metrics, chartData). Implements retry logic.
**Data Flow**: User message → FHIR resource determination → FHIR data fetch → AI processing with context → AI response parsing → Storage → Client display.

### Design System

Material Design 3 with healthcare specialization. Emphasizes clinical clarity, data-first visual priority, conversational chat interface, and professional aesthetic. Uses HSL values with CSS custom properties for theme support, standardized Tailwind spacing, and custom border radii. Persistent dark/light mode toggle with localStorage sync.

## External Dependencies

**FHIR Data Source**: Public HAPI FHIR R4 server (https://hapi.fhir.org/baseR4) for Patients, Observations, and Conditions.
**AI Integration**: Replit AI Integrations service (OpenAI-compatible API, GPT-5 model) for request analysis, report generation, conversational responses, and includes rate limiting with retry logic (p-retry) and concurrency limiting (p-limit).
**PDF Generation**: jsPDF for client-side PDF export.
**Development Tools**: Replit-specific plugins for development banner, error overlay, and cartographer integration.