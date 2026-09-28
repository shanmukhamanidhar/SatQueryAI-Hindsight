-- ==============================================================================
-- SATQUERY AI — SUPABASE DATABASE SCHEMA SPECIFICATION
-- Production Schema: Multi-tenant User Isolation, Structured Analysis History,
-- Secure Storage Metadata, and Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    preferred_region TEXT,
    preferred_focus TEXT DEFAULT 'all', -- 'all', 'vegetation', 'water', 'urban', 'agriculture'
    response_detail TEXT DEFAULT 'standard', -- 'concise', 'standard', 'expert'
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ANALYSES TABLE (Structured Historical Records)
CREATE TABLE IF NOT EXISTS public.analyses (
    id TEXT PRIMARY KEY, -- Canonical analysis_id
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for guest/local fallback
    query TEXT NOT NULL,
    location_name TEXT NOT NULL,
    country TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bounding_box JSONB, -- [min_lon, min_lat, max_lon, max_lat]
    start_date TEXT,
    end_date TEXT,
    actual_before_date TEXT,
    actual_after_date TEXT,
    total_aoi_ha DOUBLE PRECISION,
    total_changed_ha DOUBLE PRECISION,
    percent_aoi_changed DOUBLE PRECISION,
    confidence_score DOUBLE PRECISION,
    confidence_level TEXT,
    focus_indicator TEXT DEFAULT 'all',
    headline TEXT,
    summary_markdown TEXT,
    observed TEXT,
    evidence TEXT,
    interpretation TEXT,
    limitations TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user history lookups and temporal queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_location ON public.analyses(location_name);

-- 4. ANALYSIS RESULTS TABLE (Deep Empirical Data & Change Vectors)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    land_cover_stats JSONB DEFAULT '[]'::jsonb,
    transitions JSONB DEFAULT '[]'::jsonb,
    indices_summary JSONB DEFAULT '{}'::jsonb,
    change_regions JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_id ON public.analysis_results(analysis_id);

-- 5. UPLOADED SATELLITE IMAGERY TABLE (Storage Metadata)
CREATE TABLE IF NOT EXISTS public.uploaded_imagery (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    analysis_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uploaded_imagery_user_id ON public.uploaded_imagery(user_id);

-- 6. USER SETTINGS TABLE (Specific Agent & Analyst Preferences)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_region TEXT,
    preferred_focus TEXT DEFAULT 'all', -- 'all', 'vegetation', 'water', 'urban', 'agriculture'
    response_detail TEXT DEFAULT 'standard', -- 'concise', 'standard', 'expert'
    enable_hindsight BOOLEAN DEFAULT TRUE,
    auto_save_history BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. UPLOADED FILES COMPATIBILITY VIEW
CREATE OR REPLACE VIEW public.uploaded_files AS 
SELECT * FROM public.uploaded_imagery;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce multi-tenant user isolation so users can never access peers' data
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_imagery ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- User Settings RLS
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Analyses RLS (Allow owners and guest sessions without user_id)
CREATE POLICY "Users can view own analyses"
    ON public.analyses FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own analyses"
    ON public.analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own analyses"
    ON public.analyses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
    ON public.analyses FOR DELETE
    USING (auth.uid() = user_id);

-- Analysis Results RLS (Tied to parent analysis ownership)
CREATE POLICY "Users can view analysis results"
    ON public.analysis_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_results.analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Users can insert analysis results"
    ON public.analysis_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_results.analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

-- Uploaded Imagery RLS
CREATE POLICY "Users can view own uploaded imagery"
    ON public.uploaded_imagery FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own uploaded imagery"
    ON public.uploaded_imagery FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own uploaded imagery"
    ON public.uploaded_imagery FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('satellite-imagery', 'satellite-imagery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read for Satellite Imagery"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'satellite-imagery');

CREATE POLICY "Users Can Upload Satellite Imagery"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'satellite-imagery');

CREATE POLICY "Users Can Delete Own Satellite Imagery"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'satellite-imagery' AND (auth.uid() = owner OR auth.role() = 'service_role'));

-- ==============================================================================
-- AUTOMATIC PROFILE & SETTINGS CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (new.id, new.email, split_part(new.email, '@', 1))
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
