# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinanceFlow MVP is a Next.js 14 (App Router) prototype for AI-powered financial document management. This is a **fully functional frontend-only prototype** with mock data and placeholder service integrations. No backend is implemented - all data is ephemeral and stored in React Context.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### State Management Pattern

**All state is managed via React Context** (`src/context/AppContext.tsx`):
- Single AppContext provides authentication, documents, integrations, notifications, UI state, and preferences
- Uses `useApp()` hook in components to access context
- Mock authentication (any credentials work)
- No persistence - state resets on page refresh

This is intentional for MVP validation without backend dependencies.

### Mock vs Production Architecture

**Current (MVP):** Mock data in `src/data/mockData.ts` → React Context → UI components

**Production path:** Placeholder service modules in `src/services/` contain detailed implementation guides:
- `services/integrations/supabaseSync.ts` - Database operations
- `services/integrations/googleOAuth.ts` - Google OAuth flow
- `services/integrations/gmailMonitor.ts` - Gmail webhook monitoring
- `services/ai/ocrExtraction.ts` - OCR and AI extraction

Each placeholder file includes:
- Required npm packages
- Environment variables needed
- Example implementation code
- Integration patterns

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages (file-based routing)
│   ├── page.tsx           # Login page (/)
│   ├── dashboard/         # Dashboard (/dashboard)
│   ├── documents/         # Document list and viewer (/documents, /documents/[id])
│   ├── upload/            # Upload interface (/upload)
│   ├── analytics/         # Analytics (/analytics)
│   └── settings/          # Settings (/settings)
│
├── components/
│   ├── layout/            # Sidebar, Topbar, MainLayout
│   └── charts/            # Recharts chart components
│
├── context/               # React Context for global state
│   └── AppContext.tsx     # Main application context
│
├── types/index.ts         # TypeScript type definitions
├── data/mockData.ts       # Mock data for prototype
├── lib/utils.ts           # Utility functions (clsx, date formatting)
└── services/              # Placeholder integration modules
```

### Key Architectural Decisions

1. **App Router over Pages Router**: Using Next.js 14 App Router with server components where possible
2. **Layout Pattern**: All authenticated pages use `MainLayout` component (sidebar + topbar)
3. **Path Aliases**: `@/*` maps to `src/*` (configured in `tsconfig.json`)
4. **Styling**: Tailwind CSS with custom color system in `tailwind.config.ts`
5. **Charts**: Recharts library for all data visualizations
6. **File Upload**: react-dropzone for drag-and-drop (uploads are simulated in MVP)

### Type System

All types are centralized in `src/types/index.ts`:
- Document types: `Document`, `DocumentStatus`, `DocumentType`, `ExtractedData`
- User types: `User`, `Organization`, `UserRole`, `SubscriptionTier`
- Integration types: `Integration`, `Notification`, `UserPreferences`
- Data types: `VendorInfo`, `AmountInfo`, `DateInfo`, `LineItem`

Types match the data models from the PRD to ensure smooth transition to production.

### Authentication Flow

**Current (Mock):**
1. User enters any credentials or clicks "Continue with Google (Mock)"
2. `AppContext.login()` or `loginWithGoogle()` sets `isAuthenticated = true`
3. Pages check `isAuthenticated` and redirect to `/dashboard` if true
4. Logout clears user state and redirects to login

**Production:** Replace mock methods with Supabase Auth and Google OAuth (see placeholder files)

### Document Processing Flow

**Current (Mock):**
1. User uploads file via drag-and-drop → `addDocument()` in context
2. Simulated processing: upload → OCR → extraction (setTimeout delays)
3. Document appears in list with extracted data from mock generator
4. Review workflow: users can edit extracted fields and approve

**Production:** Replace with actual file upload to Supabase Storage, Google Cloud Vision OCR, and OpenAI GPT-4 extraction

## Important Notes for Development

### When Modifying State
- All state mutations go through AppContext methods
- Never mutate context state directly
- Use functional updates for array/object state (`prev => ...`)

### When Adding New Pages
1. Create folder in `src/app/your-route/`
2. Add `page.tsx` with MainLayout wrapper (for authenticated pages)
3. Add route to Sidebar navigation (`src/components/layout/Sidebar.tsx`)
4. Use `useApp()` hook to access context

### When Working with Mock Data
- Mock data is in `src/data/mockData.ts`
- Documents include full extraction data with confidence scores
- Notifications, integrations, and metrics are all pre-populated
- No validation of file types in upload (any file works)

### Responsive Design
- Desktop: Sidebar navigation (collapsible) + main content area
- Mobile: Bottom navigation bar + hamburger menu for sidebar
- Breakpoints defined in Tailwind config

### Known Limitations (By Design)
- No data persistence (refresh resets state)
- No real file processing
- PDF preview shows placeholder icon
- All authentication bypassed
- Charts use static 12-month mock data

These limitations are intentional to focus on UI/UX validation before backend implementation.
