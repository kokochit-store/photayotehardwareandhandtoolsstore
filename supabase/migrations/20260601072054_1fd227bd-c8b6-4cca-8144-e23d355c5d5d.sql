
-- Remove the broad public SELECT policy that exposed all columns (including cost_price)
DROP POLICY IF EXISTS "Public can read non-sensitive product columns" ON public.products;

-- Revoke direct table read access from public roles; public reads go through the safe view
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.products FROM authenticated;
-- Admins still read via the "Admins can view full products" policy (requires SELECT grant)
GRANT SELECT ON public.products TO authenticated;

-- Ensure the public view is accessible
GRANT SELECT ON public.products_public TO anon, authenticated;
