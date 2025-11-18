# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinanceFlow MVP is an AI-powered financial document management application built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. It features real PDF upload and AI-powered data extraction for electricity bills using Supabase (database/storage) and OpenAI GPT-4o-mini.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Setup

The app operates in two modes:

1. **Mock mode** (default): Works with mock data, no configuration needed
2. **Real mode**: Requires configuration in `.env.local`:

```bash
# Required for real PDF upload and processing
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Database setup: Run `supabase-setup.sql` in Supabase SQL Editor to create tables, RLS policies, and storage bucket.

## Architecture

### State Management

The app uses React Context API (`src/context/AppContext.tsx`) for global state:
- **Authentication**: Mock login/logout (not real OAuth yet)
- **Documents**: CRUD operations + real-time sync via Supabase
- **Integrations**: Connection management (Gmail, Drive, Sheets - placeholders)
- **UI State**: Sidebar collapse, notifications, preferences

When Supabase is configured, documents automatically sync in real-time via WebSocket subscriptions.

### Document Processing Pipeline

This is the core feature architecture:

```
1. User uploads PDF via /upload page
   └─> POST /api/upload
       ├─ Validates file (PDF, <20MB)
       ├─ Uploads to Supabase Storage (bucket: 'documents')
       ├─ Creates DB record (status: 'processing')
       └─ Triggers async processing

2. Background processing
   └─> POST /api/process-document
       ├─ Downloads PDF from storage
       ├─ Extracts text (pdf-parse)
       ├─ AI extraction (OpenAI GPT-4o-mini)
       │   └─ Prompt: src/lib/services/ocrService.ts:34-90
       ├─ Calculates confidence scores
       ├─ Updates DB record
       │   ├─ If confidence ≥ 70%: status = 'complete'
       │   └─ If confidence < 70%: status = 'review'
       └─ Real-time sync to frontend via Supabase

3. Frontend updates automatically
   └─> useDocuments hook (src/hooks/useDocuments.ts)
       └─ Subscribes to postgres_changes channel
       └─ Updates local state on INSERT/UPDATE/DELETE
```

**Key files:**
- Upload API: `src/app/api/upload/route.ts`
- Processing API: `src/app/api/process-document/route.ts`
- OCR Service: `src/lib/services/ocrService.ts`
- Real-time hook: `src/hooks/useDocuments.ts`

### Database Schema

Single table: `documents` (see `supabase-setup.sql`)

**Key fields:**
- File metadata: `file_name`, `file_url`, `file_size`, `mime_type`
- Extracted data: `vendor_name`, `total_amount`, `currency`, `document_date`, `due_date`, `category`
- Full extraction JSON: `extraction_data` (JSONB)
- Processing: `status` (pending | processing | complete | review | failed), `confidence_score`

**Security:**
- Row Level Security (RLS) enabled - users can only access their own documents
- Storage bucket uses folder-based policies: `{userId}/{filename}`

### AI Extraction

The `ocrService.ts` extracts structured data from electricity bills:
- Uses `pdf-parse` for text extraction
- Sends text to OpenAI GPT-4o-mini with structured JSON prompt
- Extracts: vendor, amounts (subtotal/tax/total), dates (issued/due/service period), account/meter numbers, kWh usage
- Returns confidence scores (overall + per-field)
- Documents with <70% confidence flagged for manual review

**Cost:** ~$0.002 per document using gpt-4o-mini

### Routing Structure

Next.js App Router (`src/app/`):
- `/` - Login page (mock auth)
- `/signup` - Signup page
- `/dashboard` - Metrics, charts, recent documents
- `/documents` - Grid/list view with filters
- `/documents/[id]` - Document viewer with inline editing
- `/upload` - Drag-drop PDF upload interface
- `/analytics` - Spending trends and insights
- `/settings` - Integrations and preferences

All pages (except login/signup) wrapped in `MainLayout` component which includes `Sidebar` and `Topbar`.

### Real-time Synchronization

When Supabase is configured:
1. `useDocuments` hook subscribes to database changes
2. Listens for INSERT/UPDATE/DELETE events filtered by `user_id`
3. Automatically updates local state without page refresh
4. Works across multiple browser tabs

This enables the "upload → processing → complete" flow to update the UI automatically as the document progresses through the pipeline.

## Key Patterns

### Dual-mode Operation

Code checks if Supabase is configured before attempting real operations:

```typescript
// src/hooks/useDocuments.ts
if (!isSupabaseConfigured() || !userId) {
  setLoading(false);
  return; // Falls back to mock data
}
```

This allows the app to work as a prototype without backend setup, but switches to real functionality when configured.

### Document Status Flow

```
pending → processing → (complete | review | failed)
              ↓              ↑
         OCR + AI      (confidence < 70%)
```

Documents requiring review (low confidence) can be edited inline in the document viewer.

### Type Safety

All types defined in `src/types/index.ts`. Database records transformed to match frontend types in `useDocuments.ts:transformDocument()`.

## Integration Placeholders

The `src/services/` directory contains placeholder modules with detailed implementation guides:
- `integrations/googleOAuth.ts` - OAuth 2.0 flow
- `integrations/gmailMonitor.ts` - Gmail webhook monitoring
- `integrations/supabaseSync.ts` - Database operations
- `ai/ocrExtraction.ts` - OCR patterns

These are documentation, not working code. Supabase and OpenAI integrations are already implemented in `src/lib/` and `src/app/api/`.

## What's Implemented vs Mock

**Real (with configuration):**
- ✅ PDF upload to Supabase Storage
- ✅ Text extraction from PDFs
- ✅ AI-powered data extraction
- ✅ Database persistence
- ✅ Real-time document sync
- ✅ Confidence scoring
- ✅ Status tracking

**Mock (no backend needed):**
- ✅ Authentication (any email/password works)
- ✅ Dashboard metrics and analytics
- ✅ Navigation and UI
- ✅ Settings interface

**Not implemented:**
- ❌ Real Google OAuth
- ❌ Gmail/Drive/Sheets integrations
- ❌ Multi-user authentication
- ❌ Unit/integration tests

## Common Development Tasks

**Add a new page:**
1. Create `src/app/your-page/page.tsx`
2. Import and use `MainLayout` component
3. Add navigation link in `src/components/layout/Sidebar.tsx`

**Modify extraction logic:**
Edit the prompt in `src/lib/services/ocrService.ts:34-90` to extract different fields or support different document types.

**Add new document status:**
1. Update status type in `src/types/index.ts`
2. Add color mapping in `src/lib/utils.ts:getStatusColor()`
3. Update database schema if persisting to Supabase

**Test PDF upload:**
1. Ensure `.env.local` is configured
2. Run `npm run dev`
3. Navigate to /upload
4. Drop an electricity bill PDF
5. Watch real-time status updates in /documents

## Technical Notes

- **Model:** Next.js 14 uses App Router (not Pages Router)
- **Styling:** Tailwind with custom theme in `tailwind.config.ts`
- **Path alias:** `@/*` maps to `src/*`
- **API routes:** Use Node.js runtime (for pdf-parse and OpenAI SDK)
- **File size limit:** 20MB for PDF uploads
- **Real-time:** Supabase uses WebSocket connections for subscriptions
- **Authentication:** Currently mock - uses context state only, no JWT/sessions

## Deployment

Built for Vercel deployment:
- Zero-config deployment with `vercel deploy`
- Environment variables set in Vercel dashboard
- Automatic HTTPS and CDN
- Edge network for static assets

For other platforms, use `npm run build && npm start` with Node.js server.
