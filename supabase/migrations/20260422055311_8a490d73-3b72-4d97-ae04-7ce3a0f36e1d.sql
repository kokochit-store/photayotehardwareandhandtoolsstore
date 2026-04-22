-- Revert to security_invoker
ALTER VIEW public.products_public SET (security_invoker = true);

-- Re-add the permissive SELECT policy. This is safe because the column-level
-- GRANT on public.products restricts non-admins to non-sensitive columns
-- (cost_price was revoked earlier). Selecting cost_price directly will fail
-- with a permission error for anon/authenticated roles.
CREATE POLICY "Public can read non-sensitive product columns"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);