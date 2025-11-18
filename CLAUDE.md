# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run build        # Create production build
npm start            # Start production server
npm run lint         # Run ESLint

# Environment setup (required for real PDF processing)
cp .env.example .env.local  # Copy and configure with Supabase + OpenAI keys
```

## Architecture Overview

### Hybrid Data Model

The application operates in **two modes**:

1. **Mock Mode** (default): Fully functional UI with `mockData.ts` - no backend required
2. **Real Mode**: Full PDF processing with Supabase + OpenAI when `.env.local` is configured

The codebase seamlessly falls back to mock data when environment variables are missing. Check `src/lib/supabase.ts:isSupabaseConfigured()` for the pattern.

### Document Processing Pipeline

When a PDF is uploaded with real configuration:

```
Upload API (/api/upload/route.ts)
  ↓ Validates PDF, creates storage path
  ↓ Uploads to Supabase Storage (bucket: 'documents')
  ↓ Creates DB record with status='processing'
  ↓ Triggers async processing
  ↓
Process API (/api/process-document/route.ts)
  ↓ Downloads PDF from storage
  ↓ Extracts text with pdf-parse
  ↓ Sends to OpenAI GPT-4o-mini for structured extraction
  ↓ Updates DB with extracted data + confidence scores
  ↓ Sets status to 'complete' or 'review' (if confidence < 0.7)
```

**Critical**: The upload returns immediately with status='processing'. The actual extraction happens asynchronously. Frontend uses Supabase real-time subscriptions (`useDocuments.ts:19-50`) to receive updates.

### State Management Architecture

**AppContext** (`src/context/AppContext.tsx`) is the single source of truth for:
- Authentication state (currently mock, designed for Supabase Auth replacement)
- Documents array (from mock data OR Supabase via `useDocuments` hook)
- Integrations, notifications, user preferences
- UI state (sidebar collapsed)

**Pattern**: Pages consume context via `useApp()` hook. The `useDocuments` hook (used in documents page) bypasses context for direct Supabase integration with real-time updates.

### Type System & Data Transformation

**Key types** in `src/types/index.ts`:
- `Document`: Frontend model (rich, nested structure)
- Database schema (in `supabase-setup.sql`): Flattened with JSONB `extraction_data`

**Transformation layer** at `src/hooks/useDocuments.ts:transformDocument()` maps database records to frontend `Document` type. This is the **single point** where DB schema meets frontend types.

### Next.js App Router Structure

```
src/app/
├── page.tsx                    # Login (root route)
├── dashboard/page.tsx          # Main dashboard with metrics
├── documents/
│   ├── page.tsx               # Document list (grid/list views)
│   └── [id]/page.tsx          # Document detail/review interface
├── upload/page.tsx            # Drag-drop upload interface
├── analytics/page.tsx         # Charts and insights
├── settings/page.tsx          # Integrations & preferences
└── api/
    ├── upload/route.ts        # File upload + storage creation
    └── process-document/route.ts  # OCR + AI extraction
```

All pages except login and signup wrap content in `MainLayout` component which provides sidebar navigation and requires authentication via `useApp()`.

### OCR & AI Extraction Service

**Service**: `src/lib/services/ocrService.ts`

- Uses `pdf-parse` for text extraction (not Google Vision - simpler, cheaper)
- Sends extracted text to OpenAI with structured prompt
- Enforces JSON response format via `response_format: { type: 'json_object' }`
- Returns confidence scores per field for review workflow
- Designed specifically for electricity bills (prompt is tailored)

**To extend** to other document types: Create new extraction functions with type-specific prompts following `extractElectricityBillData()` pattern.

### Database Schema (Supabase)

Schema in `supabase-setup.sql` creates:
- `documents` table with RLS policies (users see only their own)
- Storage bucket `documents` with folder-based isolation (`userId/timestamp_filename.pdf`)
- Real-time triggers for `updated_at`
- Indexes on `user_id`, `status`, `created_at`, `category`

**Important**: The app uses `SUPABASE_SERVICE_ROLE_KEY` in API routes to bypass RLS for uploads. Frontend uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` with RLS enforcement.

## Development Patterns

### Adding New Document Types

1. Update prompt in `src/lib/services/ocrService.ts` (or create new extraction function)
2. Ensure `DocumentType` in `src/types/index.ts` includes new type
3. Update category mapping in processing pipeline
4. Test with sample PDFs

### Working with Mock vs Real Data

- **Always check** `isSupabaseConfigured()` before attempting real operations
- Mock data lives in `src/data/mockData.ts` - update here for testing UI without backend
- Context methods (login, addDocument, etc.) are mocked but follow real API patterns
- When adding features, implement mock version first for UI testing

### Environment Variables

Required for real PDF processing:
```bash
NEXT_PUBLIC_SUPABASE_URL          # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public anon key
SUPABASE_SERVICE_ROLE_KEY         # Secret! Server-side only
OPENAI_API_KEY                    # For AI extraction
NEXT_PUBLIC_APP_URL               # For internal API calls (default: localhost:3000)
```

Missing these variables causes graceful fallback to mock mode - not errors.

## Key Files for Understanding Flow

1. **src/context/AppContext.tsx** - Start here to understand state management
2. **src/types/index.ts** - All TypeScript interfaces, document status types
3. **src/app/api/upload/route.ts** - Entry point for file uploads
4. **src/lib/services/ocrService.ts** - Core extraction logic
5. **src/hooks/useDocuments.ts** - Real-time data sync and transformation layer
6. **src/data/mockData.ts** - Sample data structure for testing

## Technology Stack Notes

- **Next.js 14**: Uses App Router (not Pages Router)
- **Supabase**: PostgreSQL + Storage + Real-time subscriptions
- **OpenAI**: GPT-4o-mini for cost-effective extraction (~$0.002/doc)
- **pdf-parse**: Simple text extraction (no OCR for scanned images)
- **Recharts**: All analytics charts
- **Tailwind CSS**: Utility-first styling, config in `tailwind.config.ts`

## Future Integration Points

The codebase includes placeholder services in `src/services/integrations/`:
- `googleOAuth.ts` - OAuth 2.0 setup guide
- `gmailMonitor.ts` - Gmail webhook monitoring pattern
- `supabaseSync.ts` - Database operation examples

These are **documentation files** with implementation guides, not active code.
