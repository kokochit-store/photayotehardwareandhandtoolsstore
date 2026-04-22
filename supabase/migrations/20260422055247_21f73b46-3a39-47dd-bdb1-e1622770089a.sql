-- Remove the permissive policy; force all non-admin reads to go through products_public view.
DROP POLICY IF EXISTS "Anyone can read products through safe view" ON public.products;

-- The view uses security_invoker=true, so the caller's role is used to check
-- the underlying table's RLS. Switch the view to security_definer so it can
-- read the table on behalf of public users without needing a permissive policy.
ALTER VIEW public.products_public SET (security_invoker = false);

-- Re-grant SELECT on the view (definer mode runs as view owner = postgres, which bypasses RLS)
GRANT SELECT ON public.products_public TO anon, authenticated;