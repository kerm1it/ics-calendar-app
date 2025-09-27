# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: This project uses Bun as the primary package manager, with npm as fallback.

```bash
# Development
bun run dev                 # Start development server
bun install                # Install dependencies

# Building and Testing
bun run build              # Build for production (TypeScript compilation + Vite build)
bun run lint               # Run ESLint with TypeScript rules
bun test                   # Run all tests
bun test --watch           # Run tests in watch mode
bun test --coverage        # Run tests with coverage report
bun run preview            # Preview production build locally
```

## Architecture Overview

### Core Application Structure

This is a React + TypeScript calendar application that generates RFC5545-compliant ICS files. The app supports both solar (Gregorian) and lunar (Chinese) calendar events.

**Key Design Patterns:**
- **Event System**: Uses discriminated unions (`BirthdayEvent | RegularEvent`) for type-safe event handling
- **Modular Utilities**: Core logic separated into specialized utility classes (`ICSGenerator`, `LunarConverter`)
- **Form-driven UI**: Separate form components with structured data flow through typed interfaces

### Data Flow Architecture

1. **State Management**: Single root state in `App.tsx` containing `Calendar` object with nested `CalendarEvent[]`
2. **Form Handling**: Type-safe form data interfaces (`BirthdayFormData`, `EventFormData`) that convert to domain events
3. **ICS Generation**: Declarative approach using `ICSGeneratorOptions` with configurable year ranges for recurring events

### Critical Business Logic

**Lunar Calendar Conversion** (`src/utils/lunarConverter.ts`):
- Supports years 1900-2100 with hardcoded astronomical data
- Converts lunar dates to corresponding solar dates for each generated year
- Handles leap months and variable month lengths automatically

**ICS File Generation** (`src/utils/icsGenerator.ts`):
- Generates RFC5545-compliant calendar files
- Automatically creates recurring birthday events across configurable year ranges
- Supports complex recurrence rules for regular events
- Handles timezone definitions and reminders

**Analytics Integration** (`src/utils/analytics.ts`):
- Google Analytics 4 integration with custom event tracking
- Only enabled in production when `VITE_GA_MEASUREMENT_ID` is set
- Tracks user interactions: event creation, deletions, ICS downloads, tab switches

### Type System

**Core Domain Types** (`src/types/index.ts`):
- `CalendarEvent = BirthdayEvent | RegularEvent` - Discriminated union for type safety
- `Reminder` - Flexible time-based reminder system with optional specific times
- `RecurrenceFrequency` - RFC5545-compliant recurrence patterns

**Form Types**:
- Separate form data types that validate and transform to domain events
- `BirthdayFormData` handles both solar and lunar date inputs
- `EventFormData` supports complex recurrence configurations

### Component Architecture

**Forms**: Self-contained form components that handle their own validation and emit structured data
**Event Management**: `EventList` component handles display and deletion with callback patterns
**Tab System**: Active tab state controls form visibility and tracks user navigation via analytics

### Environment Configuration

```bash
# Required for production analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Testing Strategy

Tests are located in `src/tests/` and cover:
- `helpers.test.ts` - Utility function testing
- `icsGenerator.test.ts` - ICS output validation
- `lunarConverter.test.ts` - Lunar conversion accuracy

Use `bun test --watch` for development testing.