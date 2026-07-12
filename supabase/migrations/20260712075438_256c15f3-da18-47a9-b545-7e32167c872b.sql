DROP POLICY IF EXISTS "Public can view products" ON public.products;
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT ON public.products_public TO anon, authenticated;