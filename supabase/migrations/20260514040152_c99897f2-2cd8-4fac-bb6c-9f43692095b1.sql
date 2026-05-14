
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  admin_count int;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count > 0 THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- Seed default homepage sections
INSERT INTO public.homepage_content (section, payload, enabled) VALUES
('hero', '{"title":"The Future of Digital Commerce","subtitle":"Curated AI tools, premium subscriptions, and learning."}'::jsonb, true),
('announcement', '{"text":"Limited time: extra 20% off premium tools — code FLASH25"}'::jsonb, true),
('flash_sale', '{"title":"Flash Sale","ends_at":null}'::jsonb, true)
ON CONFLICT (section) DO NOTHING;

-- Seed default site settings
INSERT INTO public.site_settings (key, value) VALUES
('branding', '{"name":"NovaMarket","tagline":"Premium futuristic marketplace"}'::jsonb),
('contact', '{"email":"hello@novamarket.app","phone":"","whatsapp":""}'::jsonb),
('social', '{"twitter":"","instagram":"","github":""}'::jsonb),
('seo', '{"title":"NovaMarket","description":"A premium futuristic marketplace."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
