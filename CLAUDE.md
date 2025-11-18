# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinanceFlow MVP is an AI-powered financial document management system. This is a **fully functional UI/UX prototype** built with Next.js 14, React, TypeScript, and Tailwind CSS. All backend integrations are mocked - the focus is on demonstrating the complete user interface and experience without requiring actual API connections.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture Overview

### State Management Pattern

The application uses **React Context API** for centralized state management via `AppContext` (src/context/AppContext.tsx). This is the single source of truth for:

- Authentication state (mock login/logout)
- Document CRUD operations
- Integration management (Gmail, Drive, Sheets)
- Notifications
- UI state (sidebar, preferences)

**Critical**: All data operations MUST go through AppContext methods. Direct state mutations will break the application flow.

### Mock-First Architecture

This MVP intentionally mocks all backend operations:

- **Authentication**: Accepts any email/password (no validation)
- **File uploads**: Simulates processing with timeouts
- **Integrations**: Mock OAuth flows with fake tokens
- **Data persistence**: In-memory only (resets on refresh)

The mock data lives in `src/data/mockData.ts` and provides realistic sample data for 6 financial documents with complete extraction metadata.

### Service Layer Design

The `src/services/` directory contains **placeholder modules** that document production implementation:

- `services/integrations/googleOAuth.ts` - OAuth 2.0 flow with token management
- `services/integrations/gmailMonitor.ts` - Gmail webhook monitoring
- `services/integrations/supabaseSync.ts` - Database operations
- `services/ai/ocrExtraction.ts` - OCR and AI entity extraction pipeline

Each service file includes:
- Detailed inline comments explaining production requirements
- Required npm packages and environment variables
- API integration patterns and code examples
- Mock implementations for MVP functionality

When adding backend integration, start by reading these files - they contain the implementation blueprint.

### Type System

All types are defined in `src/types/index.ts`. The type system is comprehensive and matches the PRD data models. Key types:

- `Document`: Core financial document with extraction data
- `ExtractionData`: Nested structure for vendor, amounts, dates, line items
- `DocumentStatus`: 'pending' | 'processing' | 'review' | 'complete' | 'failed'
- `Integration`: Google service connection state

Always reference existing types rather than creating new ones. The type system enforces the PRD specification.

### Component Organization

```
src/components/
├── layout/           # MainLayout, Sidebar, Topbar (navigation chrome)
└── charts/           # Recharts-based visualization components

src/app/              # Next.js App Router pages
├── page.tsx          # Login page (root route)
├── dashboard/        # Main dashboard with metrics
├── documents/        # Document list and detail viewer
├── upload/           # Drag-and-drop upload interface
├── analytics/        # Spending trends and insights
├── settings/         # Integration and preference management
└── layout.tsx        # Root layout with AppProvider
```

Pages that require authentication should use the `useApp()` hook to access `isAuthenticated` and redirect if needed.

## Key Patterns

### Adding a New Page

1. Create `src/app/your-route/page.tsx`
2. Wrap content with `<MainLayout>` component for navigation
3. Use `useApp()` hook to access context
4. Add navigation link in `src/components/layout/Sidebar.tsx`

### Working with Documents

Documents flow through these states: `pending` → `processing` → `review` (if confidence < 85%) → `complete`

Update document status using the context method:
```typescript
const { updateDocument } = useApp();
updateDocument(documentId, { status: 'complete' });
```

### Authentication Flow

The app uses a mock authentication system:
- Login page at `/` (src/app/page.tsx)
- After login, redirects to `/dashboard`
- `AppContext` manages `isAuthenticated` state
- No real session tokens or cookies

To add real authentication, replace `AppContext` login methods with Supabase Auth calls (see README.md Phase 1 for setup).

### Mock Data Behavior

Since data is in-memory:
- Refreshing the page resets all state
- Document uploads are simulated with setTimeout
- OAuth flows resolve immediately with fake tokens

This is intentional - it allows rapid UI iteration without backend dependencies.

## Styling Guidelines

The project uses Tailwind CSS with a custom color palette defined in `tailwind.config.ts`:

- `primary-*`: Brand colors (blue)
- `success-*`: Green for positive actions
- `warning-*`: Orange for alerts
- `danger-*`: Red for errors
- `gray-*`: Neutral tones (default Tailwind)

Responsive design breakpoints:
- Desktop: sidebar + main content
- Mobile: bottom navigation + collapsible sidebar

## Production Migration Path

When converting from MVP to production:

1. **Backend Setup**:
   - Create Supabase project with schema from PRD
   - Set up environment variables (see README.md)
   - Install additional packages: `@supabase/supabase-js`, `googleapis`, `openai`

2. **Replace Mock Data**:
   - Update AppContext to call real APIs instead of mock functions
   - Replace `mockDocuments` with Supabase queries
   - Implement real OAuth flows using service placeholders as guides

3. **File Storage**:
   - Configure Supabase Storage buckets for document uploads
   - Update upload flow to use real blob storage URLs

4. **AI Processing**:
   - Integrate Google Vision API for OCR
   - Add OpenAI GPT-4 for entity extraction
   - Implement job queue for async processing (BullMQ recommended)

The service files in `src/services/` contain detailed implementation guides for each integration.

## Important Notes

- This is a **prototype** - data does not persist
- No actual file uploads occur (simulated only)
- All API calls are mocked
- OAuth flows are fake (no real Google integration)
- Authentication accepts any credentials

When implementing features, maintain the mock behavior for MVP testing, and add production logic as separate code paths that can be toggled via environment variables.
