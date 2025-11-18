-- =====================================================
-- FinanceFlow Database Schema Setup
-- =====================================================
-- Run this in your Supabase SQL Editor to set up the database
-- https://app.supabase.com -> SQL Editor -> New Query

-- =====================================================
-- 1. Create Documents Table
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,

    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),

    -- Extracted data
    vendor_name VARCHAR(255),
    total_amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    document_date DATE,
    due_date DATE,
    category VARCHAR(100) DEFAULT 'Utilities',

    -- Full extraction JSON (stores all extracted data)
    extraction_data JSONB,
    confidence_score FLOAT,

    -- Processing status: pending, processing, complete, review, failed
    status VARCHAR(50) DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- =====================================================
-- 3. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS Policies
-- =====================================================

-- Policy: Users can view their own documents
CREATE POLICY "Users can view own documents"
    ON documents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert own documents"
    ON documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own documents"
    ON documents
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
    ON documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. Create Storage Bucket
-- =====================================================

-- Create the 'documents' bucket for file storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. Storage Policies
-- =====================================================

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 7. Create Updated_at Trigger
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Next steps:
-- 1. Verify all tables and policies were created successfully
-- 2. Test by inserting a sample document via the SQL editor
-- 3. Configure your .env.local with the Supabase credentials
-- =====================================================
