# FinanceFlow MVP - AI-Powered Financial Document Management

A fully functional MVP built with Next.js 14, React, TypeScript, and Tailwind CSS. This application includes **real PDF upload and AI extraction** capabilities powered by Supabase and OpenAI.

## 🎯 What's Included

This MVP includes all screens and interfaces from the PRD:

### ✅ Authentication
- Login page with email/password and Google OAuth mock
- Signup page with form validation
- Session management with React Context

### ✅ Dashboard
- Key metrics display (spending, unpaid bills, cash position)
- Interactive spending trend chart (12 months)
- Category breakdown visualization
- Recent documents table
- Real-time alerts and notifications

### ✅ Document Management
- Upload interface with drag-and-drop
- Grid and list view modes
- Advanced filtering (category, status, search)
- Document viewer with PDF preview placeholder
- Review interface for low-confidence extractions
- Inline editing of extracted data

### ✅ Analytics
- Spending trends over time
- Category distribution charts
- Top vendors analysis
- AI-powered insights (mock)

### ✅ Settings
- Google Workspace integration management (Gmail, Drive, Sheets)
- User preferences (notifications, display settings)
- Account management

### ✅ Navigation
- Responsive sidebar navigation
- Collapsible sidebar for more screen space
- Mobile bottom navigation
- Search bar and notifications dropdown

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Access

Since this is a prototype with mock authentication:
- Enter **any email and password** on the login page
- Or click **"Continue with Google (Mock)"** for instant access
- You'll be automatically logged in and redirected to the dashboard

## ⚡ Enable Real PDF Upload (Optional)

The app works with mock data by default, but you can enable **real PDF upload and AI extraction** for electricity bills:

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (takes ~2 minutes to provision)
3. Go to Project Settings → API
4. Copy your:
   - Project URL
   - `anon public` key
   - `service_role` key (keep secret!)

### Step 2: Set Up Database

1. In your Supabase project, go to SQL Editor
2. Open the file `supabase-setup.sql` from this repository
3. Copy and paste the entire SQL script
4. Click "Run" to create tables, policies, and storage bucket

### Step 3: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # OpenAI
   OPENAI_API_KEY=sk-your-openai-key-here

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Step 5: Test PDF Upload

1. Go to the Upload page
2. Drag and drop an electricity bill PDF
3. Watch as the system:
   - Uploads to Supabase Storage ✓
   - Extracts text with pdf-parse ✓
   - Uses AI to extract vendor, amount, dates ✓
   - Saves to database ✓
   - Shows in Documents list ✓

**That's it!** Your app now has real PDF processing capabilities.

### What Gets Extracted

The AI extraction service (`src/lib/services/ocrService.ts`) extracts:
- **Vendor**: Utility company name and address
- **Amounts**: Subtotal, tax, and total amount
- **Dates**: Bill date, due date, service period
- **Category**: Automatically set to "Utilities"
- **Metadata**: Account number, meter number, kWh used
- **Confidence Scores**: Per-field confidence for validation

Documents with <70% confidence are flagged for review.

### Cost Estimate

- **Supabase**: Free tier includes 500MB storage, 2GB bandwidth
- **OpenAI**: ~$0.002 per document (using gpt-4o-mini)
- **Processing**: 100 documents ≈ $0.20

## 📁 Project Structure

```
src/
├── app/                      # Next.js app router pages
│   ├── page.tsx             # Login page (/)
│   ├── signup/              # Signup page
│   ├── dashboard/           # Dashboard page
│   ├── documents/           # Documents list and viewer
│   ├── upload/              # Upload interface
│   ├── analytics/           # Analytics page
│   ├── settings/            # Settings page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── layout/              # Layout components (Sidebar, Topbar)
│   └── charts/              # Chart components (Recharts)
│
├── context/                 # React Context for state management
│   └── AppContext.tsx       # Main app context
│
├── types/                   # TypeScript type definitions
│   └── index.ts             # All type definitions
│
├── data/                    # Mock data
│   └── mockData.ts          # Sample documents, metrics, etc.
│
├── lib/                     # Utility functions
│   └── utils.ts             # Helper functions
│
└── services/                # Integration placeholder modules
    ├── integrations/        # Google OAuth, Gmail, Supabase (PLACEHOLDERS)
    └── ai/                  # OCR & AI extraction (PLACEHOLDERS)
```

## 🎨 Features & Interactions

### Mock Data Flow

The prototype uses realistic mock data to simulate:
- 6 sample financial documents (invoices, bills, receipts)
- Complete extraction data with confidence scores
- Historical spending trends (12 months)
- Category and vendor analytics
- Notifications and alerts

### Interactive Elements

1. **Document Upload**
   - Drag & drop files (mock processing)
   - Progress indicators showing upload → OCR → extraction
   - Automatic status updates

2. **Document Review**
   - Split-screen view: document preview + extracted data
   - Confidence score indicators per field
   - Inline editing with save functionality
   - Approve or flag for manual review

3. **Filtering & Search**
   - Real-time search across vendors and categories
   - Filter by category and status
   - Grid/list view toggle

4. **Responsive Design**
   - Desktop: sidebar navigation + main content
   - Mobile: bottom navigation + hamburger menu
   - Collapsible sidebar on desktop

## 🔧 Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **File Upload:** React Dropzone
- **State Management:** React Context API
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **AI/OCR:** OpenAI GPT-4o-mini + pdf-parse

## 📝 What's Implemented

### ✅ Fully Functional (With Config)

When Supabase and OpenAI are configured:
- ✅ Real PDF file uploads to Supabase Storage
- ✅ OCR text extraction from PDFs
- ✅ AI-powered data extraction (vendor, amounts, dates)
- ✅ Database persistence with real-time updates
- ✅ Document status tracking (processing, review, complete)
- ✅ Confidence scoring for extraction quality
- ✅ Automatic categorization

### 🎨 Mock Data Fallback

Without configuration, app works with:
- ✅ Mock authentication
- ✅ Sample electricity bill documents
- ✅ Dashboard metrics and analytics
- ✅ All UI/UX features
- ✅ Navigation and routing

### ⏳ Not Yet Implemented

- ❌ Google OAuth (real)
- ❌ Gmail monitoring integration
- ❌ Google Drive sync
- ❌ Google Sheets integration
- ❌ Multi-user authentication
- ❌ Email notifications

### Placeholder Integration Modules

Located in `src/services/`, these files contain:
- Detailed comments explaining production implementation
- Required npm packages
- Environment variables needed
- API integration patterns
- Example code snippets

**Files:**
- `services/integrations/googleOAuth.ts` - Google OAuth 2.0
- `services/integrations/gmailMonitor.ts` - Gmail webhook monitoring
- `services/integrations/supabaseSync.ts` - Database operations
- `services/ai/ocrExtraction.ts` - OCR & AI extraction

## 🚧 Next Steps for Production

### Phase 1: Backend Setup
1. Create Supabase project
   - Set up PostgreSQL database with schema from PRD
   - Configure Storage buckets
   - Set up Row Level Security policies

2. Environment Variables
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OPENAI_API_KEY=your_openai_key
   GOOGLE_CLOUD_VISION_KEY=your_vision_key
   ```

3. Install additional packages:
   ```bash
   npm install @supabase/supabase-js googleapis openai @google-cloud/vision bullmq
   ```

### Phase 2: Integration Implementation
1. Replace mock auth with real Supabase Auth
2. Implement Google OAuth flow
3. Set up Gmail webhook monitoring
4. Integrate OCR APIs (Google Vision)
5. Integrate AI extraction (OpenAI GPT-4)
6. Connect to Supabase database

### Phase 3: Testing & Deployment
1. Add comprehensive test suite
2. Set up CI/CD pipeline
3. Deploy to Vercel/production
4. Configure custom domain
5. Set up monitoring and analytics

## 📚 Key Files to Review

### Understanding the Codebase

1. **Start here:** `src/context/AppContext.tsx`
   - See how state management works
   - Mock authentication flow
   - Document CRUD operations

2. **Mock data:** `src/data/mockData.ts`
   - Example documents with full extraction data
   - Dashboard metrics
   - User and organization data

3. **Type definitions:** `src/types/index.ts`
   - Complete TypeScript interfaces
   - Matches PRD data models

4. **Main pages:** `src/app/*/page.tsx`
   - See component structure
   - Understand routing
   - Review UI patterns

5. **Integration placeholders:** `src/services/`
   - Production implementation guides
   - API integration patterns
   - Required configurations

## 🎯 User Journey Testing

### Recommended Test Flow

1. **Onboarding**
   - Start at login page
   - Click "Continue with Google (Mock)"
   - Observe automatic redirect to dashboard

2. **Dashboard Exploration**
   - Review key metrics
   - Interact with charts (hover, click)
   - Check notifications dropdown
   - Click on recent documents

3. **Upload Documents**
   - Navigate to Upload page
   - Drag & drop any file (or click to browse)
   - Watch simulated processing (upload → OCR → complete)
   - See files appear in queue

4. **Document Management**
   - Go to Documents page
   - Toggle between grid and list views
   - Use search and filters
   - Click on a document to view details

5. **Review Interface**
   - Find the document marked "review" status
   - Click to open document viewer
   - See confidence scores per field
   - Click "Edit & Approve"
   - Make changes and save

6. **Analytics**
   - Navigate to Analytics page
   - Review spending trends
   - Check top categories and vendors
   - Read AI insights

7. **Settings**
   - Go to Settings page
   - Try connecting/disconnecting integrations
   - Update preferences
   - Save changes

## 🐛 Known Limitations

This is a prototype/MVP, so:
- Data doesn't persist (refresh resets state)
- File uploads are simulated
- Charts use static mock data
- No real authentication/authorization
- No actual API calls
- PDF preview shows placeholder icon

These are intentional to focus on UI/UX validation.

## 📞 Support & Questions

For questions about:
- **Implementation:** Review placeholder files in `src/services/`
- **UI/UX:** Check component files in `src/components/` and `src/app/`
- **Data Models:** See `src/types/index.ts`
- **PRD Reference:** Refer to the original PRD document

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: { /* your brand colors */ },
  success: { /* success colors */ },
  // etc.
}
```

### Adding New Pages

1. Create new folder in `src/app/your-page/`
2. Add `page.tsx` file
3. Import `MainLayout` component
4. Add navigation link in `Sidebar.tsx`

### Modifying Mock Data

Edit `src/data/mockData.ts` to:
- Add more sample documents
- Change metrics
- Update analytics data
- Modify user information

## 📦 Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy
```

## 🔑 Key Design Decisions

1. **Mock-first approach:** All UI is functional without backend dependencies
2. **Context API:** Simple state management suitable for MVP scope
3. **Component composition:** Reusable, modular components
4. **Mobile-first:** Responsive design from the ground up
5. **TypeScript:** Type safety for better developer experience
6. **Placeholder services:** Clear path to production implementation

---

**Built with ❤️ for FinanceFlow MVP**

This prototype demonstrates the complete user experience and serves as a foundation for full production implementation.
