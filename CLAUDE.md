# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinanceFlow is an AI-powered financial document management system. This is a **fully functional MVP prototype** built with Next.js 14 (App Router), React, TypeScript, and Tailwind CSS. The prototype demonstrates complete UI/UX without backend integrations - all data is mocked and state is managed in-memory via React Context.

**Critical Understanding**: This is a frontend-only MVP. All authentication, database operations, file uploads, and AI processing are simulated. Placeholder service files in `src/services/` contain detailed production implementation guidance.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server (run build first)
npm start

# Run ESLint
npm run lint
```

**Note**: There are no tests configured in this MVP. Testing would need to be set up with Jest/Vitest and React Testing Library.

## Architecture

### App Router Structure

This project uses Next.js 14 App Router. All pages are in `src/app/`:

- `src/app/page.tsx` - Login page (landing route)
- `src/app/signup/` - User registration
- `src/app/dashboard/` - Main dashboard with metrics and charts
- `src/app/documents/` - Document list view
- `src/app/documents/[id]/` - Individual document viewer with review interface
- `src/app/upload/` - File upload interface with drag-and-drop
- `src/app/analytics/` - Spending analytics and insights
- `src/app/settings/` - User preferences and integrations

Each page uses the `MainLayout` component which provides sidebar navigation and topbar.

### State Management

Global state is managed through **React Context API** in `src/context/AppContext.tsx`:

- **Authentication state**: `isAuthenticated`, `user`, login/logout methods
- **Documents**: CRUD operations for documents (addDocument, updateDocument, deleteDocument)
- **Integrations**: Mock Gmail/Drive/Sheets connection management
- **Notifications**: In-app notifications with read/unread status
- **UI state**: Sidebar collapse state, user preferences
- **Preferences**: Currency, date format, notification settings, default view

All components access this context via the `useApp()` hook.

### Data Flow

1. **Mock data** is defined in `src/data/mockData.ts` with 6 sample financial documents
2. **AppContext** initializes state with this mock data on mount
3. Pages consume data via `useApp()` hook
4. User interactions update in-memory state (no persistence across refreshes)
5. All async operations (login, file upload, OCR) use simulated delays with `setTimeout`

### Type System

All TypeScript types are centralized in `src/types/index.ts`:

- `Document` - Core document model with extraction data
- `ExtractionData` - AI-extracted fields (vendor, amounts, dates, line items)
- `ConfidenceScores` - Per-field confidence scores for review workflow
- `User`, `Organization` - User and org models
- `Integration`, `Notification` - Supporting models
- `DashboardMetrics`, `SpendingTrendData`, `CategoryBreakdown` - Analytics types

These types match the PRD data models and should be preserved when implementing real backend.

### Component Structure

**Layout components** (`src/components/layout/`):
- `MainLayout.tsx` - Wrapper with sidebar + topbar (used by all authenticated pages)
- `Sidebar.tsx` - Navigation with collapsible state
- `Topbar.tsx` - Search, notifications dropdown, user menu

**Chart components** (`src/components/charts/`):
- `SpendingTrendChart.tsx` - 12-month trend line chart
- `CategoryBreakdownChart.tsx` - Pie/donut chart for category distribution
- Both use Recharts library

### Styling

- **Tailwind CSS** for all styling (configured in `tailwind.config.ts`)
- Custom color palette defined for primary, success, warning, danger, info
- Responsive design with mobile-first approach
- Mobile uses bottom navigation instead of sidebar (see `Sidebar.tsx`)

## Placeholder Services (NOT IMPLEMENTED)

Files in `src/services/` are **placeholders** with production implementation guidance:

- `services/integrations/supabaseSync.ts` - Database CRUD, file storage, real-time subscriptions
- `services/integrations/googleOAuth.ts` - Google OAuth 2.0 flow
- `services/integrations/gmailMonitor.ts` - Gmail webhook monitoring for attachments
- `services/ai/ocrExtraction.ts` - OCR (Google Vision) + AI extraction (OpenAI GPT-4)

These files contain:
- Detailed comments on production implementation
- Required npm packages
- Environment variables needed
- Code structure and API patterns

**Do not attempt to implement these services** unless explicitly instructed. They are intentionally mocked.

## Key Patterns

### Authentication Flow

1. User visits `/` (login page)
2. Enters any credentials OR clicks "Continue with Google (Mock)"
3. `AppContext.login()` or `loginWithGoogle()` simulates async auth with setTimeout
4. Sets `isAuthenticated = true` and `user = mockUser`
5. User is redirected to `/dashboard`

Pages check `isAuthenticated` from context to control access (though not enforced in this MVP).

### Document Upload Flow

1. User drags file onto upload zone (`src/app/upload/page.tsx`)
2. File is added to upload queue with "uploading" status
3. Simulated progress: uploading → processing → complete (using setTimeout chains)
4. On "complete", document is added to `AppContext.documents` with mock extraction data
5. No actual file is uploaded or processed

### Document Review Flow

1. Documents with `status: 'review'` indicate low-confidence extractions
2. User clicks document in list, navigates to `/documents/[id]`
3. Split view shows: document preview (placeholder) + extracted fields
4. Fields display confidence scores (color-coded: red < 70%, yellow 70-90%, green > 90%)
5. User clicks "Edit & Approve" to modify fields inline
6. Saving updates the document in AppContext state

### Path Aliases

TypeScript path alias `@/*` maps to `src/*` (configured in `tsconfig.json`). Always use:

```typescript
import { useApp } from '@/context/AppContext';
import { Document } from '@/types';
import { mockDocuments } from '@/data/mockData';
```

## Production Migration Path

When moving to production:

1. **Backend Setup**:
   - Create Supabase project with schema matching `src/types/index.ts`
   - Set up Storage buckets for document files
   - Configure Row Level Security policies

2. **Environment Variables** (create `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   OPENAI_API_KEY=
   GOOGLE_CLOUD_VISION_KEY=
   ```

3. **Install Production Dependencies**:
   ```bash
   npm install @supabase/supabase-js googleapis openai @google-cloud/vision bullmq
   ```

4. **Replace Mock Services**:
   - Uncomment production code in `src/services/` placeholder files
   - Update `AppContext.tsx` to call real APIs instead of mock data
   - Replace `mockData.ts` imports with database queries

5. **Authentication**:
   - Replace mock login in `AppContext.tsx` with Supabase Auth
   - Implement Google OAuth callback route
   - Add session persistence

The README.md provides detailed production migration steps.

## Important Constraints

- **No persistence**: Refreshing the page resets all state to initial mock data
- **No file handling**: Uploaded files are not stored or processed
- **No API calls**: All operations are simulated in-memory
- **No authentication**: Any credentials work for login (mock auth)
- **PDF preview**: Document viewer shows placeholder instead of actual PDF

These are intentional MVP limitations to focus on UI/UX validation.

## Making Changes

When modifying this codebase:

1. **Preserve type safety**: All changes should maintain TypeScript strict mode compliance
2. **Keep mock data realistic**: If adding features, update `mockData.ts` with realistic samples
3. **Maintain responsive design**: Test changes on mobile viewport (Tailwind breakpoints)
4. **Update Context carefully**: Changes to `AppContext.tsx` affect all pages
5. **Don't add real backends**: Unless explicitly migrating to production, keep services mocked
6. **Follow existing patterns**: Match the component structure and state management patterns already in use

## File Naming Conventions

- Pages: `page.tsx` (App Router convention)
- Components: PascalCase (e.g., `SpendingTrendChart.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Types: `index.ts` in `types/` directory
- Data: `mockData.ts` for all sample data
