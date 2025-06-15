
-- =================================================================
-- SECURITY HOTFIX: RLS Policy Standardization (v2 - Corrected)
-- =================================================================
-- This script corrects the previous failed migration by first
-- dropping all dependent policies (including from storage.objects)
-- before dropping the deprecated is_admin() function.
-- =================================================================

-- STEP 1: Drop all existing RLS policies from public and storage schemas.
-- This ensures a clean slate and removes dependencies on the old function.
DO $$
DECLARE
    policy_record RECORD;
    table_name_record RECORD;
BEGIN
    -- Drop policies from 'public' schema
    FOR table_name_record IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        FOR policy_record IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = table_name_record.tablename
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.' || quote_ident(table_name_record.tablename);
        END LOOP;
    END LOOP;

    -- Drop policies from 'storage.objects' as they also depend on the old function
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- STEP 2: Remove the deprecated is_admin() function.
-- Now that no policies depend on it, it can be safely removed.
DROP FUNCTION IF EXISTS public.is_admin();

-- STEP 3: Create new, standardized RLS policies and enable RLS on all relevant tables.

-- TABLE: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_current_user_admin());

-- TABLE: articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are publicly visible" ON public.articles FOR SELECT USING (published = true);
CREATE POLICY "Admins have full access to articles" ON public.articles FOR ALL USING (public.is_current_user_admin());

-- TABLE: suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Non-hidden suppliers are publicly visible" ON public.suppliers FOR SELECT USING (hidden = false);
CREATE POLICY "Admins have full access to suppliers" ON public.suppliers FOR ALL USING (public.is_current_user_admin());

-- TABLE: categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly visible" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins have full access to categories" ON public.categories FOR ALL USING (public.is_current_user_admin());

-- TABLE: suppliers_categories
ALTER TABLE public.suppliers_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Supplier-category links are publicly visible" ON public.suppliers_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage supplier-category links" ON public.suppliers_categories FOR ALL USING (public.is_current_user_admin());

-- TABLE: reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Non-hidden reviews are publicly visible" ON public.reviews FOR SELECT USING (hidden = false);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can manage their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to reviews" ON public.reviews FOR ALL USING (public.is_current_user_admin());

-- TABLE: favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- TABLE: user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own notifications" ON public.user_notifications FOR ALL USING (auth.uid() = user_id);

-- TABLE: notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to notifications" ON public.notifications FOR ALL USING (public.is_current_user_admin());

-- ADMIN-ONLY TABLES
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to active_sessions" ON public.active_sessions FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to blocked_ips" ON public.blocked_ips FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to login_logs" ON public.login_logs FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.review_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to review_bans" ON public.review_bans FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to security_settings" ON public.security_settings FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.supplier_import_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to supplier_import_history" ON public.supplier_import_history FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.tracking_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to tracking_settings" ON public.tracking_settings FOR ALL USING (public.is_current_user_admin());

-- PUBLIC READ, ADMIN WRITE TABLES
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read SEO settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage SEO settings" ON public.seo_settings FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read article categories" ON public.article_categories FOR SELECT USING (true);
CREATE POLICY "Admins have full access to article_categories" ON public.article_categories FOR ALL USING (public.is_current_user_admin());

ALTER TABLE public.feature_access_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read feature access rules" ON public.feature_access_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage feature access rules" ON public.feature_access_rules FOR ALL USING (public.is_current_user_admin());

-- TABLE: free_trial_config
ALTER TABLE public.free_trial_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own trial config" ON public.free_trial_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all trial configs" ON public.free_trial_config FOR SELECT USING (public.is_current_user_admin());

-- STEP 4: Re-create necessary policies for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view public storage objects" ON storage.objects FOR SELECT USING (bucket_id IN (SELECT id FROM storage.buckets WHERE public = true));
CREATE POLICY "Users can manage their own storage objects" ON storage.objects FOR ALL USING (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins have full access to storage" ON storage.objects FOR ALL USING (public.is_current_user_admin());

